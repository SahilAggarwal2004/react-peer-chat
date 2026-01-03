import { DataConnection, MediaConnection, Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { defaultConfig } from "./constants.js";
import { closeConnection } from "./lib/connection.js";
import { getStorage, setStorage } from "./lib/storage.js";
import { addPrefix } from "./lib/utils.js";
import { Message, RemotePeers, useChatProps } from "./types.js";

export function useChat({
  name,
  peerId,
  remotePeerId = [],
  peerOptions,
  text = true,
  recoverChat = false,
  audio: allowed = true,
  onError = () => alert("Browser not supported! Try some other browser."),
  onMicError = () => alert("Microphone not accessible!"),
  onMessageSent,
  onMessageReceived,
}: useChatProps) {
  const [audio, setAudio] = useAudio(allowed);
  const audioStreamRef = useRef<HTMLMediaElement>(null);
  const connRef = useRef<{ [id: string]: DataConnection }>({});
  const localStream = useRef<MediaStream>(null);
  const [messages, setMessages, addMessage] = useMessages();
  const [peer, setPeer] = useState<Peer>();
  const [remotePeers, setRemotePeers] = useStorage<RemotePeers>("rpc-remote-peer", {});

  peerId = addPrefix(peerId);
  if (typeof remotePeerId === "string") remotePeerId = [remotePeerId];
  const remotePeerIds = remotePeerId.map(addPrefix);

  function handleConnection(conn: DataConnection) {
    connRef.current[conn.peer] = conn;
    conn.on("open", () => {
      conn.on("data", ({ message, messages, remotePeerName, type }: any) => {
        if (type === "message") receiveMessage(message);
        else if (type === "init") {
          setRemotePeers((prev) => {
            prev[conn.peer] = remotePeerName || "Anonymous User";
            return prev;
          });
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
    if (!text && !audio) {
      setPeer(undefined);
      return;
    }
    (async function () {
      const {
        Peer,
        util: {
          supports: { audioVideo, data },
        },
      } = await import("peerjs");
      if (!data || !audioVideo) return onError();
      const peer = new Peer(peerId, { config: defaultConfig, ...peerOptions });
      setPeer(peer);
    })();
  }, [audio]);

  useEffect(() => {
    if (!peer) return;
    let calls: { [id: string]: MediaConnection } = {};
    peer.on("open", () => {
      remotePeerIds.forEach((id) => {
        if (text) handleConnection(peer.connect(id));
      });
      if (audio) {
        // @ts-ignore
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        try {
          getUserMedia(
            {
              video: false,
              audio: {
                autoGainControl: false, // Disable automatic gain control
                noiseSuppression: true, // Enable noise suppression
                echoCancellation: true, // Enable echo cancellation
              },
            },
            (stream: MediaStream) => {
              localStream.current = stream;
              remotePeerIds.forEach((id) => {
                const call = peer.call(id, stream);
                call.on("stream", handleRemoteStream);
                call.on("close", call.removeAllListeners);
                calls[id] = call;
              });
              peer.on("call", (call) => {
                call.answer(stream); // Answer the call with an A/V stream.
                call.on("stream", handleRemoteStream);
                call.on("close", call.removeAllListeners);
                calls[call.peer] = call;
              });
            },
            handleError
          );
        } catch {
          handleError();
        }
      }
    });

    peer.on("connection", handleConnection);

    return () => {
      localStream.current?.getTracks().forEach((track) => track.stop());
      Object.values(connRef.current).forEach(closeConnection);
      connRef.current = {};
      Object.values(calls).forEach(closeConnection);
      peer.removeAllListeners();
      peer.destroy();
    };
  }, [peer]);

  return { peerId, audioStreamRef, remotePeers, messages, sendMessage, audio, setAudio };
}

export function useMessages() {
  const [messages, setMessages] = useStorage<Message[]>("rpc-messages", []);

  const addMessage = (message: Message) => setMessages((prev) => prev.concat(message));

  return [messages, setMessages, addMessage] as const;
}

export function useStorage<Value>(key: string, initialValue: Value, local = false): [Value, (value: Value | ((old: Value) => Value)) => void] {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    return getStorage(key, initialValue, local);
  });
  const setValue = (value: Value | ((old: Value) => Value)) => {
    setStoredValue((old: Value) => {
      const updatedValue = typeof value === "function" ? (value as Function)(old) : value;
      setStorage(key, updatedValue, local);
      return updatedValue;
    });
  };
  return [storedValue, setValue];
}

export function useAudio(allowed: boolean) {
  const [audio, setAudio] = useStorage("rpc-audio", false, true);
  const enabled = audio && allowed;

  return [enabled, setAudio] as const;
}
