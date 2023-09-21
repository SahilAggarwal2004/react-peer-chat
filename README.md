# react-peer-chat
An easy to use react component for impleting peer-to-peer chatting using [peerjs](https://peerjs.com/) under the hood.

## Features
- Peer-to-peer chat without need to have any knowledge about WebRTC
- Easy to use
- Supports text chat that persists on page reload
- Clear text chat on command
- Supports voice chat
- Multiple peer connections. See [multi peer usage](#Multi-Peer-Usage)
- Fully Customizable. See [usage with FoC](#Full-Customization)
## Installation
To install react-peer-chat
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
`react-peer-chat` default exports `<Chat>` component. When you use the `<Chat>` component, initially the user will see 2 buttons (svg icons), one for text chat and other for voice chat.

It also exports a `clearChat` function that clears the text chat whenever invoked.
#### Basic Usage
```jsx
import React from 'react';
import Chat, { clearChat } from 'react-peer-chat';
import 'react-peer-chat/build/styles.css';

export default function App() {
    return <div>
        <Chat
            name='John Doe'
            peerId='my-unique-id'
            remotePeerId='remote-unique-id'
        />
        {/* Text chat will be cleared when following button is clicked. */}
        <button onClick={clearChat}>Clear Chat</button>
    </div>
}
```
#### Multi Peer Usage
```jsx
import React from 'react';
import Chat, { clearChat } from 'react-peer-chat';
import 'react-peer-chat/build/styles.css';

export default function App() {
    return <div>
        <Chat
            name='John Doe'
            peerId='my-unique-id'
            remotePeerId={['remote-unique-id-1', 'remote-unique-id-2', 'remote-unique-id-3']} // Array of remote peer ids
        />
        {/* Text chat will be cleared when following button is clicked. */}
        <button onClick={clearChat}>Clear Chat</button>
    </div>
}
```
#### Partial Customization
Use props provided by `<Chat>` component to customize it.
```jsx
import React from 'react';
import Chat from 'react-peer-chat';
import 'react-peer-chat/build/styles.css';

export default function App() {
    return <Chat 
        name='John Doe'
        peerId='my-unique-id'
        remotePeerId='remote-unique-id'
        dialogOptions={{
            position: 'left',
            style: { padding: '4px' }
        }}
        props={{ title: 'React Peer Chat Component' }}
        onError={() => {
            console.error('Microphone not accessible!');
        }}
    />
}
```
#### Full Customization 
Use Function as Children(FoC) to fully customize the `<Chat>` component.
```jsx
import React from 'react'
import Chat from 'react-peer-chat'
// import 'react-peer-chat/build/styles.css' (No need to import CSS when using custom component)

export default function App() {
    return <Chat
        name='John Doe'
        peerId='my-unique-id'
        remotePeerId='remote-unique-id'
        onError={() => {
            console.error('Microphone not accessible!');
        }}
    >
        {({ remotePeers, messages, addMessage, audio, setAudio }) => (
            <YourCustomComponent>
                {...}
            </YourCustomComponent>
        )}
    </Chat>
}
```
## Chat Component API Reference
Here is the full API for the `<Chat>` component, these properties can be set on an instance of Chat:
| Parameter | Type | Required | Default | Description |
| - | - | - | - | - |
| `name` | `string` | No | Anonymous User | Name of the peer which will be shown to the remote peer. |
| `peerId` | `string` | Yes | - | It is the unique id that is alloted to a peer. It uniquely identifies a peer from other peers. |
| `remotePeerId` | `string \| string[]` | No | - | It is the unique id (or array of unique ids) of the remote peer(s). If provided, the peer will try to connect to the remote peer(s). |
| `text` | `boolean` | No | `true` | Text chat will be enabled if this property is set to true. |
| `voice` | `boolean` | No | `true` | Voice chat will be enabled if this property is set to true. |
| `peerOptions` | [`PeerOptions`](#PeerOptions) | No | - | Options to customize peerjs Peer instance. |
| `dialogOptions` | [`DialogOptions`](#DialogOptions) | No | { position: 'center' } | Options to customize text dialog box styling. |
| `onError` | `Function` | No | `() => alert('Microphone not accessible!')` | Function to be executed when microphone is not accessible. |
| `props` | `React.DetailedHTMLProps` | No | - | Props to customize the `<Chat>` component. |
| `children` | [`Children`](#Children) | No | - | Props to customize the `<Chat>` component. |
### Types
#### PeerOptions
```typescript
import { PeerOptions } from 'peerjs'
```
#### DialogOptions
```typescript
import { CSSProperties } from 'react';
type DialogPosition = 'left' | 'center' | 'right';
type DialogOptions = {
    position: DialogPosition;
    style: CSSProperties;
};
```
#### Children
```typescript
import { ReactNode } from 'react';
type RemotePeers = { [id: string]: string }
type Message = {
    id: string;
    text: string;
};
type ChildrenOptions = {
    remotePeers?: RemotePeers;
    messages?: Message[];
    addMessage?: (message: Message, sendToRemotePeer?: boolean) => void;
    audio?: boolean;
    setAudio?: (audio: boolean) => void;
};
type Children = (childrenOptions: ChildrenOptions) => ReactNode;
```
## Used By
- [StarWars](https://starwarsgame.vercel.app/)
## Author
[Sahil Aggarwal](https://www.github.com/SahilAggarwal2004)