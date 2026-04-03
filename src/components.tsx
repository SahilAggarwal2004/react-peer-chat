import { useChat } from "@/hooks";
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from "@/icons";
import styles from "@/style.module.css";
import type { ChatProps, Message } from "@/types";
import React, { useEffect, useRef, useState } from "react";

export default function Chat({ text = true, audio = true, onMessageReceived, dialogOptions, props = {}, children, ...hookProps }: ChatProps) {
  const { peerId, ...childrenOptions } = useChat({
    text,
    audio,
    onMessageReceived: receiveMessageHandler,
    ...hookProps,
  });
  const { remotePeers, messages, sendMessage, audio: audioEnabled, setAudio } = childrenOptions;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState(false);

  function receiveMessageHandler(message: Message) {
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
    <div className={`${styles["main-container"]} ${styles["font"]}`} {...props}>
      {typeof children === "function" ? (
        children(childrenOptions)
      ) : (
        <>
          {text && (
            <div className={styles["dialog-container"]}>
              {dialog ? (
                <BiSolidMessageX title="Close chat" onClick={() => setDialog(false)} />
              ) : (
                <div className={styles["notification"]}>
                  <BiSolidMessageDetail
                    title="Open chat"
                    onClick={() => {
                      setNotification(false);
                      setDialog(true);
                    }}
                  />
                  {notification && <span className={styles["badge"]} />}
                </div>
              )}
              <dialog ref={dialogRef} className={`${dialog ? styles["dialog"] : ""} ${styles[`position-${dialogOptions?.position || "center"}`]}`} style={dialogOptions?.style}>
                <div className={styles["heading"]}>Chat</div>
                <hr className={styles["hr"]} />
                <div>
                  <div ref={containerRef} className={styles["message-container"]}>
                    {messages.map(({ id, name, text }, i) => (
                      <div key={i}>
                        <strong>{id === peerId ? "You" : name}: </strong>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <hr className={styles["hr"]} />
                  <form
                    className={styles["input-container"]}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = inputRef.current?.value;
                      if (text) {
                        inputRef.current!.value = "";
                        sendMessage({ id: peerId, text });
                      }
                    }}
                  >
                    <input ref={inputRef} className={`${styles["input"]} ${styles["font"]}`} placeholder="Enter a message" />
                    <button type="submit" className={styles["button"]}>
                      <GrSend title="Send message" />
                    </button>
                  </form>
                </div>
              </dialog>
            </div>
          )}
          {audio && (
            <button className={styles["button"]} onClick={() => setAudio(!audioEnabled)}>
              {audioEnabled ? <BsFillMicFill title="Turn mic off" /> : <BsFillMicMuteFill title="Turn mic on" />}
            </button>
          )}
        </>
      )}
    </div>
  );
}
