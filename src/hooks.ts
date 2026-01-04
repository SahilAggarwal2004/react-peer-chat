import type { DataConnection, MediaConnection, Peer } from "peerjs";
import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { defaults } from "./constants.js";
import { closeConnection } from "./lib/connection.js";
import { getStorage, setStorage } from "./lib/storage.js";
import { addPrefix } from "./lib/utils.js";
import type { Message, RemotePeers, UseChatProps, UseChatReturn } from "./types.js";
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
  onError = () => alert("Browser not supported! Try some other browser."),
  onMicError = () => alert("Microphone not accessible!"),
  onMessageSent,
  onMessageReceived,
}: UseChatProps): UseChatReturn {
  const [peer, setPeer] = useState<Peer>();
  const [audio, setAudio] = useAudio(allowed);
  const connRef = useRef<Record<string, DataConnection>>({});
  const callsRef = useRef<Record<string, MediaConnection>>({});
  const audioContextRef = useRef<AudioContext>(null);
  const mixerRef = useRef<GainNode>(null);
  const sourceNodesRef = useRef<Record<string, MediaStreamAudioSourceNode | undefined>>({});
  const [messages, setMessages, addMessage] = useMessages();
  const [remotePeers, setRemotePeers] = useStorage<RemotePeers>("rpc-remote-peer", {});

  const { completePeerId, completeRemotePeerIds } = useMemo(() => {
    const remotePeerIds = Array.isArray(remotePeerId) ? remotePeerId : [remotePeerId];
    return { completePeerId: addPrefix(peerId), completeRemotePeerIds: remotePeerIds.map(addPrefix) };
  }, [peerId]);

  function handleCall(call: MediaConnection) {
    const id = call.peer;
    call.on("stream", (stream) => handleRemoteStream(id, stream));
    call.on("close", () => {
      call.removeAllListeners();
      removePeerAudio(id);
      delete callsRef.current[id];
    });
    callsRef.current[id] = call;
  }

  function handleConnection(conn: DataConnection) {
    connRef.current[conn.peer] = conn;
    conn.on("open", () => {
      conn.on("data", ({ message, messages, remotePeerName, type }: any) => {
        if (type === "message") receiveMessage(message);
        else if (type === "init") {
          setRemotePeers((prev) => ({ ...prev, [conn.peer]: remotePeerName }));
          if (recoverChat) setMessages((old) => (messages.length > old.length ? messages : old));
        }
      });
      conn.send({ type: "init", remotePeerName: name, messages });
    });
    conn.on("close", conn.removeAllListeners);
  }

  function handleError() {
    setAudio(false);
    onMicError();
  }

  function handleRemoteStream(peerId: string, remoteStream: MediaStream) {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    if (!mixerRef.current) {
      mixerRef.current = audioContextRef.current.createGain();
      mixerRef.current.connect(audioContextRef.current.destination);
    }

    removePeerAudio(peerId);

    const source = audioContextRef.current.createMediaStreamSource(remoteStream);
    source.connect(mixerRef.current);
    sourceNodesRef.current[peerId] = source;
  }

  function receiveMessage(message: Message) {
    addMessage(message);
    onMessageReceived?.(message);
  }

  function removePeerAudio(peerId: string) {
    if (!sourceNodesRef.current[peerId]) return;
    sourceNodesRef.current[peerId].disconnect();
    delete sourceNodesRef.current[peerId];
  }

  function sendMessage(message: Message) {
    addMessage(message);
    Object.values(connRef.current).forEach((conn) => conn.send({ type: "message", message }));
    onMessageSent?.(message);
  }

  useEffect(() => {
    if (!text && !audio) return;

    import("peerjs").then(
      ({
        Peer,
        util: {
          supports: { audioVideo, data },
        },
      }) => {
        if (!data || !audioVideo) return onError();

        const peer = new Peer(completePeerId, { config: defaultConfig, ...peerOptions });
        peer.on("connection", handleConnection);
        setPeer(peer);
      }
    );

    return () => {
      setPeer((prev) => {
        prev?.removeAllListeners();
        prev?.destroy();
        return undefined;
      });
    };
  }, [completePeerId]);

  useEffect(() => {
    if (!text || !peer) return;

    const handleOpen = () => completeRemotePeerIds.forEach((id) => handleConnection(peer.connect(id)));

    if (peer.open) handleOpen();
    else peer.once("open", handleOpen);

    return () => {
      Object.values(connRef.current).forEach(closeConnection);
      connRef.current = {};
    };
  }, [text, peer]);

  useEffect(() => {
    if (!audio || !peer) return;

    let localStream: MediaStream;

    const setupAudio = () =>
      navigator.mediaDevices
        .getUserMedia({
          video: false,
          audio: {
            autoGainControl: false, // Disable automatic gain control
            noiseSuppression: true, // Enable noise suppression
            echoCancellation: true, // Enable echo cancellation
          },
        })
        .then((stream: MediaStream) => {
          localStream = stream;
          completeRemotePeerIds.forEach((id) => {
            if (callsRef.current[id]) return;
            const call = peer.call(id, stream);
            handleCall(call);
          });
          peer.on("call", (call) => {
            if (callsRef.current[call.peer]) return call.close();
            call.answer(stream);
            handleCall(call);
          });
        })
        .catch(handleError);

    if (peer.open) setupAudio();
    else peer.once("open", setupAudio);

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      Object.values(callsRef.current).forEach(closeConnection);
      callsRef.current = {};
      Object.keys(sourceNodesRef.current).forEach(removePeerAudio);
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
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") return initialValue;
    return getStorage(key, initialValue, local);
  });

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
