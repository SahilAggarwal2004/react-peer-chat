# react-peer-chat

A simple-to-use React component for implementing peer-to-peer chatting, powered by [peerjs](https://peerjs.com/).

## Features

- Peer-to-peer chat without requiring knowledge of [WebRTC](https://webrtc.org/)
- Easy integration
- Supports persistent text chat across page reloads
- Recovers old chats upon reconnection
- Option to clear chat on command
- Supports audio/voice chat
- Multiple peer connections. See [multi-peer usage](#Multi-Peer-Usage)
- Fully customizable. See [usage with FaC](#Full-Customization)

## Installation

To install `react-peer-chat`:

```bash
  # with npm:
  npm install react-peer-chat --save

  # with yarn:
  yarn add react-peer-chat

  # with pnpm:
  pnpm add react-peer-chat

  # with bun:
  bun add react-peer-chat
```

## Usage

`react-peer-chat` provides two primary methods to integrate chat functionality into your React apps: through the `<Chat>` component and the `useSpeech` hook.

It also exports a `clearChat` function that clears the text chat from the browser's session storage when called.

### Chat Component

The default export of `react-peer-chat` is the `<Chat>` component, which offers the easiest integration and is fully configurable. When using the `<Chat>` component, the user will initially see two buttons (SVG icons) - one for text chat and the other for voice chat.

#### Basic Usage

```jsx
import React from "react";
import Chat, { clearChat } from "react-peer-chat";
import "react-peer-chat/styles.css";

export default function App() {
  return (
    <div>
      <Chat name="John Doe" peerId="my-unique-id" remotePeerId="remote-unique-id" />
      {/* Text chat will be cleared when following button is clicked. */}
      <button onClick={clearChat}>Clear Chat</button>
    </div>
  );
}
```

#### Multi Peer Usage

```jsx
import React from "react";
import Chat, { clearChat } from "react-peer-chat";
import "react-peer-chat/styles.css";

export default function App() {
  return (
    <div>
      <Chat
        name="John Doe"
        peerId="my-unique-id"
        remotePeerId={["remote-unique-id-1", "remote-unique-id-2", "remote-unique-id-3"]} // Array of remote peer ids
      />
      {/* Text chat will be cleared when following button is clicked. */}
      <button onClick={clearChat}>Clear Chat</button>
    </div>
  );
}
```

#### Partial Customization

Use the props provided by the `<Chat>` component for customization.

```jsx
import React from "react";
import Chat from "react-peer-chat";
import "react-peer-chat/styles.css";

export default function App() {
  return (
    <Chat
      name="John Doe"
      peerId="my-unique-id"
      remotePeerId="remote-unique-id"
      dialogOptions={{
        position: "left",
        style: { padding: "4px" },
      }}
      props={{ title: "React Peer Chat Component" }}
      onError={() => console.error("Browser not supported!")}
      onMicError={() => console.error("Microphone not accessible!")}
    />
  );
}
```

#### Full Customization

Use Function as Children (FaC) to fully customize the `<Chat>` component.

```jsx
import React from 'react'
import Chat from 'react-peer-chat'
// import 'react-peer-chat/styles.css' (No need to import CSS when using custom component)

export default function App() {
    return <Chat
        name='John Doe'
        peerId='my-unique-id'
        remotePeerId='remote-unique-id'
        onError={() => console.error('Browser not supported!')}
        onMicError={() => console.error('Microphone not accessible!')}
    >
        {({ remotePeers, messages, sendMessage, audio, setAudio }) => (
            <YourCustomComponent>
                {...}
            </YourCustomComponent>
        )}
    </Chat>
}
```

#### Custom ICE Servers

You can also provide custom ICE servers to avoid connectivity issues if the free TURN server provided by `react-peer-chat` expires.

```jsx
import React from "react";
import Chat from "react-peer-chat";
import "react-peer-chat/styles.css";

export default function App() {
  return (
    <Chat
      name="John Doe"
      peerId="my-unique-id"
      remotePeerId="remote-unique-id"
      peerOptions={{
        config: {
          iceServers: [
            { urls: "stun:stun-server.example.com:19302" },
            {
              urls: "turn:turn-server.example.com:19403",
              username: "optional-username",
              credential: "auth-token",
            },
          ],
        },
        // other peerjs options (optional)
      }}
    />
  );
}
```

### useChat Hook

The `useChat` hook is ideal when you want to completely redesign the Chat UI or handle the audio stream differently, instead of using traditional playback methods.

```jsx
import React, { useEffect, useRef, useState } from "react";
import { clearChat, useChat } from "react-peer-chat";
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from "react-peer-chat/icons";
import "react-peer-chat/styles.css"; // (No need to import CSS when using custom styles)

function Chat({ text = true, audio = true, onMessageReceived, dialogOptions, props = {}, children, ...hookProps }) {
  const { peerId, audioStreamRef, ...childrenOptions } = useChat({
    text,
    audio,
    onMessageReceived: modifiedOnMessageReceived,
    ...hookProps,
  });
  const { remotePeers, messages, sendMessage, audio: audioEnabled, setAudio } = childrenOptions;
  const containerRef = useRef(null);
  const [dialog, setDialog] = useState(false);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [notification, setNotification] = useState(false);

  function modifiedOnMessageReceived(message) {
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
                        inputRef.current.value = "";
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
          {audio && <button>{audioEnabled ? <BsFillMicFill title="Turn mic off" onClick={() => setAudio(false)} /> : <BsFillMicMuteFill title="Turn mic on" onClick={() => setAudio(true)} />}</button>}
        </>
      )}
      {audio && audioEnabled && <audio ref={audioStreamRef} autoPlay style={{ display: "none" }} />}
    </div>
  );
}

export default function App() {
  return (
    <div>
      <Chat name="John Doe" peerId="my-unique-id" remotePeerId="remote-unique-id" />
      {/* Text chat will be cleared when following button is clicked. */}
      <button onClick={clearChat}>Clear Chat</button>
    </div>
  );
}
```

#### Basic Usage

## API Reference

### useChat Hook

Here is the full API for the `useChat` hook, these options can be passed as paramerters to the hook:
| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `name` | `string` | No | Anonymous User | Name of the peer which will be shown to the remote peer. |
| `peerId` | `string` | Yes | - | It is the unique id that is alloted to a peer. It uniquely identifies a peer from other peers. |
| `remotePeerId` | `string \| string[]` | No | - | It is the unique id (or array of unique ids) of the remote peer(s). If provided, the peer will try to connect to the remote peer(s). |
| `text` | `boolean` | No | `true` | Text chat will be enabled if this property is set to true. |
| `recoverChat` | `boolean` | No | `false` | Old chats will be recovered upon reconnecting with the same peer(s). |
| `audio` | `boolean` | No | `true` | Voice chat will be enabled if this property is set to true. |
| `peerOptions` | [`PeerOptions`](#PeerOptions) | No | - | Options to customize peerjs Peer instance. |
| `onError` | `Function` | No | `() => alert('Browser not supported! Try some other browser.')` | Function to be executed if browser doesn't support `WebRTC` |
| `onMicError` | `Function` | No | `() => alert('Microphone not accessible!')` | Function to be executed when microphone is not accessible. |
| `onMessageSent` | `Function` | No | - | Function to be executed when a text message is sent to other peers. |
| `onMessageReceived` | `Function` | No | - | Function to be executed when a text message is received from other peers. |

### Chat Component

Here is the full API for the `<Chat>` component, these properties can be set on an instance of `<Chat>`. It contains all the parameters
that are listed in [useChat Hook API Reference](#usechat-hook-1) along with the following parameters:
| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `dialogOptions` | [`DialogOptions`](#DialogOptions) | No | { position: 'center' } | Options to customize text dialog box styling. |
| `props` | `React.DetailedHTMLProps` | No | - | Props to customize the `<Chat>` component. |
| `children` | [`Children`](#Children) | No | - | See [usage with FaC](#Full-Customization) |

### Types

#### PeerOptions

```typescript
import { PeerOptions } from "peerjs";
```

#### DialogOptions

```typescript
import { CSSProperties } from "react";
type DialogPosition = "left" | "center" | "right";
type DialogOptions = {
  position: DialogPosition;
  style: CSSProperties;
};
```

#### Children

```typescript
import { ReactNode } from "react";
type RemotePeers = { [id: string]: string };
type Message = {
  id: string;
  text: string;
};
type ChildrenOptions = {
  remotePeers?: RemotePeers;
  messages?: Message[];
  sendMessage?: (message: Message) => void;
  audio?: boolean;
  setAudio?: (audio: boolean) => void;
};
type Children = (childrenOptions: ChildrenOptions) => ReactNode;
```

## Author

[Sahil Aggarwal](https://www.github.com/SahilAggarwal2004)
