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
  const connRef = useRef<{ [id: string]: DataConnection }>({});
  const localStreamRef = useRef<MediaStream>(null);
  const audioStreamRef = useRef<HTMLMediaElement>(null);
  const callsRef = useRef<{ [id: string]: MediaConnection }>({});
  const [messages, setMessages, addMessage] = useMessages();
  const [remotePeers, setRemotePeers] = useStorage<RemotePeers>("rpc-remote-peer", {});

  const { completePeerId, completeRemotePeerIds } = useMemo(() => {
    const remotePeerIds = Array.isArray(remotePeerId) ? remotePeerId : [remotePeerId];
    return { completePeerId: addPrefix(peerId), completeRemotePeerIds: remotePeerIds.map(addPrefix) };
  }, [peerId]);

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

  function handleRemoteStream(remoteStream: MediaStream) {
    if (audioStreamRef.current) audioStreamRef.current.srcObject = remoteStream;
  }

  function receiveMessage(message: Message) {
    addMessage(message);
    onMessageReceived?.(message);
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
          localStreamRef.current = stream;
          completeRemotePeerIds.forEach((id) => {
            const call = peer.call(id, stream);
            call.on("stream", handleRemoteStream);
            call.on("close", call.removeAllListeners);
            callsRef.current[id] = call;
          });
          peer.on("call", (call) => {
            call.answer(stream);
            call.on("stream", handleRemoteStream);
            call.on("close", call.removeAllListeners);
            callsRef.current[call.peer] = call;
          });
        })
        .catch(handleError);

    if (peer.open) setupAudio();
    else peer.once("open", setupAudio);

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      Object.values(callsRef.current).forEach(closeConnection);
      callsRef.current = {};
    };
  }, [audio, peer]);

  return { peerId: completePeerId, audioStreamRef, remotePeers, messages, sendMessage, audio, setAudio };
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
