import type { DataConnection, MediaConnection, Peer } from "peerjs";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { defaults } from "./constants.js";
import { closeConnection } from "./lib/connection.js";
import { getStorage, setStorage } from "./lib/storage.js";
import { addPrefix } from "./lib/utils.js";
import type { InputMessage, Message, RemotePeers, ResetConnectionType, UseChatProps, UseChatReturn } from "./types.js";
import { isSetStateFunction } from "./lib/react.js";

const { config: defaultConfig, peerOptions: defaultPeerOptions, remotePeerId: defaultRemotePeerId } = defaults;

export function useChat({
  peerId,
  name = "Anonymous User",
  remotePeerId = defaultRemotePeerId,
  peerOptions = defaultPeerOptions,
  text = true,
  recoverChat = false,
  audio: allowed = true,
  onError = console.error,
  onPeerError = console.error,
  onNetworkError,
  onMessageSent,
  onMessageReceived,
}: UseChatProps): UseChatReturn {
  const [peer, setPeer] = useState<Peer>();
  const [audio, setAudio] = useAudio(allowed);
  const connRef = useRef<Record<string, DataConnection>>({});
  const callsRef = useRef<Record<string, MediaConnection>>({});
  const audioContextRef = useRef<AudioContext>(null);
  const mixerRef = useRef<GainNode>(null);
  const sourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode | undefined>>({});
  const [messages, setMessages, addMessage] = useMessages();
  const [remotePeers, setRemotePeers] = useStorage<RemotePeers>("rpc-remote-peer", {});

  const { completePeerId, completeRemotePeerIds } = useMemo(() => {
    const remotePeerIds = Array.isArray(remotePeerId) ? remotePeerId : [remotePeerId];
    return { completePeerId: addPrefix(peerId), completeRemotePeerIds: remotePeerIds.map(addPrefix) };
  }, [peerId]);

  function resetConnections(type: ResetConnectionType = "all") {
    switch (type) {
      case "all":
        resetConnections("data");
        resetConnections("call");
        break;
      case "data":
        Object.values(connRef.current).forEach(closeConnection);
        connRef.current = {};
        break;
      case "call":
        Object.values(callsRef.current).forEach(closeConnection);
        Object.keys(sourceNodesRef.current).forEach(removePeerAudio);
        callsRef.current = {};
        break;
    }
  }

  function handleConnection(conn: DataConnection) {
    const peerId = conn.peer;
    if (connRef.current[peerId]) return conn.close();

    connRef.current[peerId] = conn;

    conn.on("open", () => {
      conn.on("data", ({ type, message, messages, remotePeerName }: any) => {
        switch (type) {
          case "init":
            setRemotePeers((prev) => ({ ...prev, [peerId]: remotePeerName }));
            if (recoverChat) setMessages((old) => (messages.length > old.length ? messages : old));
            break;
          case "message":
            receiveMessage(message);
            break;
        }
      });

      conn.send({ type: "init", remotePeerName: name, messages });
    });

    conn.on("close", () => {
      conn.removeAllListeners();
      delete connRef.current[peerId];
    });
  }

  function handleCall(call: MediaConnection) {
    const peerId = call.peer;
    if (callsRef.current[peerId]) return call.close();

    call.on("stream", () => {
      callsRef.current[peerId] = call;
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === "suspended") audioContextRef.current.resume();
      if (!mixerRef.current) {
        mixerRef.current = audioContextRef.current.createGain();
        mixerRef.current.connect(audioContextRef.current.destination);
      }
      removePeerAudio(peerId);
      const audio = new Audio();
      audio.srcObject = call.remoteStream;
      audio.autoplay = true;
      audio.muted = false;
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(mixerRef.current);
      sourceNodesRef.current[peerId] = source;
    });

    call.on("close", () => {
      call.removeAllListeners();
      removePeerAudio(peerId);
      delete callsRef.current[peerId];
    });
  }

  function receiveMessage(message: Message) {
    addMessage(message);
    onMessageReceived?.(message);
  }

  function removePeerAudio(peerId: string) {
    const source = sourceNodesRef.current[peerId];
    if (!source) return;
    source.disconnect();
    delete sourceNodesRef.current[peerId];
  }

  function sendMessage(message: InputMessage) {
    const event = { type: "message", message: { ...message, name } };
    addMessage(event.message);
    Object.values(connRef.current).forEach((conn) => conn.send(event));
    onMessageSent?.(event.message);
  }

  useEffect(() => {
    if (!text && !audio) return;

    let destroyed = false;

    import("peerjs").then(
      ({
        Peer,
        util: {
          supports: { audioVideo, data },
        },
      }) => {
        if (!data || !audioVideo) return onError(new Error("Browser not supported! Try some other browser."));

        const peer = new Peer(completePeerId, { config: defaultConfig, ...peerOptions });
        peer.on("connection", handleConnection);
        peer.on("call", handleCall);
        peer.on("disconnected", () => {
          resetConnections();
          peer.reconnect();
        });
        peer.on("error", (error) => {
          if (error.type === "network" || error.type === "server-error") {
            resetConnections();
            setTimeout(() => peer.reconnect(), 1000);
            onNetworkError?.(error);
          }
          onPeerError(error);
        });
        if (destroyed) peer.destroy();
        else setPeer(peer);
      },
    );

    return () => {
      destroyed = true;
      setPeer((prev) => {
        prev?.destroy();
        return undefined;
      });
    };
  }, [completePeerId]);

  useEffect(() => {
    if (!text || !peer) return;

    const connectData = () => completeRemotePeerIds.forEach((id) => handleConnection(peer.connect(id)));

    if (peer.open) connectData();
    peer.on("open", connectData);

    return () => {
      peer.off("open", connectData);
      resetConnections("data");
    };
  }, [text, peer]);

  useEffect(() => {
    if (!audio || !peer) return;

    let localStream: MediaStream;

    const setupAudio = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: { autoGainControl: true, noiseSuppression: true, echoCancellation: true } });
        completeRemotePeerIds.forEach((id) => {
          if (!callsRef.current[id]) handleCall(peer.call(id, localStream));
        });
      } catch {
        setAudio(false);
        onError(new Error("Microphone not accessible"));
      }
    };

    if (peer.open) setupAudio();
    peer.on("open", setupAudio);

    return () => {
      peer.off("open", setupAudio);
      localStream?.getTracks().forEach((track) => track.stop());
      resetConnections("call");
      audioContextRef.current?.close();
      audioContextRef.current = null;
      mixerRef.current = null;
    };
  }, [audio, peer]);

  return { peerId: completePeerId, remotePeers, messages, sendMessage, audio, setAudio };
}

export function useMessages(): readonly [Message[], (value: SetStateAction<Message[]>) => void, (message: Message) => void] {
  const [messages, setMessages] = useStorage<Message[]>("rpc-messages", []);

  const addMessage = (message: Message) => setMessages((prev) => prev.concat(message));

  return [messages, setMessages, addMessage] as const;
}

export function useStorage<T>(key: string, initialValue: T, local?: boolean): readonly [T, (value: SetStateAction<T>) => void];
export function useStorage<T>(key: string, initialValue?: T, local?: boolean): readonly [T | undefined, (value: SetStateAction<T | undefined>) => void];
export function useStorage<T>(key: string, initialValue?: T, local = false) {
  const [storedValue, setStoredValue] = useState<T | undefined>(() => (typeof window === "undefined" ? initialValue : getStorage(key, initialValue, local)));

  const setValue = (value: SetStateAction<T | undefined>) => {
    setStoredValue((prev) => {
      const next = isSetStateFunction(value) ? value(prev) : value;
      setStorage(key, next, local);
      return next;
    });
  };

  return [storedValue, setValue] as const;
}

export function useAudio(allowed: boolean): readonly [boolean, (value: SetStateAction<boolean>) => void] {
  const [audio, setAudio] = useStorage("rpc-audio", false, true);
  const enabled = audio && allowed;

  return [enabled, setAudio] as const;
}
