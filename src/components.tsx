import React, { useEffect, useRef, useState } from "react";

import { useChat } from "./hooks.js";
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from "./icons.js";
import "./styles.css";
import type { ChatProps, Message } from "./types.js";

export default function Chat({ text = true, audio = true, onMessageReceived, dialogOptions, props = {}, children, ...hookProps }: ChatProps) {
  const { peerId, audioStreamRef, ...childrenOptions } = useChat({
    text,
    audio,
    onMessageReceived: modifiedOnMessageReceived,
    ...hookProps,
  });
  const { remotePeers, messages, sendMessage, audio: audioEnabled, setAudio } = childrenOptions;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState(false);

  function modifiedOnMessageReceived(message: Message) {
    if (!dialogRef.current?.open) setNotification(true);
    onMessageReceived?.(message);
  }

  useEffect(() => {
    if (dialog) dialogRef.current?.show();
    else dialogRef.current?.close();
  }, [dialog]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [dialog, remotePeers, messages]);

  return (
    <div className="rpc-main rpc-font" {...props}>
      {typeof children === "function" ? (
        children(childrenOptions)
      ) : (
        <>
          {text && (
            <div className="rpc-dialog-container">
              {dialog ? (
                <BiSolidMessageX title="Close chat" onClick={() => setDialog(false)} />
              ) : (
                <div className="rpc-notification">
                  <BiSolidMessageDetail
                    title="Open chat"
                    onClick={() => {
                      setNotification(false);
                      setDialog(true);
                    }}
                  />
                  {notification && <span className="rpc-badge" />}
                </div>
              )}
              <dialog ref={dialogRef} className={`${dialog ? "rpc-dialog" : ""} rpc-position-${dialogOptions?.position || "center"}`} style={dialogOptions?.style}>
                <div className="rpc-heading">Chat</div>
                <hr className="rpc-hr" />
                <div>
                  <div ref={containerRef} className="rpc-message-container">
                    {messages.map(({ id, text }, i) => (
                      <div key={i}>
                        <strong>{id === peerId ? "You" : remotePeers[id]}: </strong>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="rpc-hr" />
                  <form
                    className="rpc-input-container"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = inputRef.current?.value;
                      if (text) {
                        inputRef.current!.value = "";
                        sendMessage({ id: peerId, text });
                      }
                    }}
                  >
                    <input ref={inputRef} className="rpc-input rpc-font" placeholder="Enter a message" />
                    <button type="submit" className="rpc-button">
                      <GrSend title="Send message" />
                    </button>
                  </form>
                </div>
              </dialog>
            </div>
          )}
          {audio && (
            <button className="rpc-button" onClick={() => setAudio(!audioEnabled)}>
              {audioEnabled ? <BsFillMicFill title="Turn mic off" /> : <BsFillMicMuteFill title="Turn mic on" />}
            </button>
          )}
        </>
      )}
      {audio && audioEnabled && <audio ref={audioStreamRef} autoPlay style={{ display: "none" }} />}
    </div>
  );
}
