import { DataConnection, MediaConnection, PeerOptions } from "peerjs";
import { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode, RefObject, SetStateAction } from "react";

// lib/connection.ts
export type Connection = DataConnection | MediaConnection;

// hooks.ts
export type ErrorHandler = () => void;

export type Message = { id: string; text: string };

export type MessageEventHandler = (message: Message) => void;

export type { PeerOptions };

export type RemotePeerId = string | string[];

export type UseChatProps = {
  peerId: string;
  name?: string;
  remotePeerId?: RemotePeerId;
  text?: boolean;
  recoverChat?: boolean;
  audio?: boolean;
  peerOptions?: PeerOptions;
  onError?: ErrorHandler;
  onMicError?: ErrorHandler;
  onMessageSent?: MessageEventHandler;
  onMessageReceived?: MessageEventHandler;
};

export type UseChatReturn = {
  peerId: string;
  audioStreamRef: RefObject<HTMLMediaElement | null>;
  remotePeers: RemotePeers;
  messages: Message[];
  sendMessage: (message: Message) => void;
  audio: boolean;
  setAudio: (value: SetStateAction<boolean>) => void;
};

// icons.tsx
export type IconProps = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

// index.tsx
export type ChatProps = UseChatProps & {
  dialogOptions?: DialogOptions;
  props?: DivProps;
  children?: Children;
};

export type Children = (childrenOptions: ChildrenOptions) => ReactNode;

export type ChildrenOptions = {
  remotePeers?: RemotePeers;
  messages?: Message[];
  sendMessage?: (message: Message) => void;
  audio?: boolean;
  setAudio?: (audio: boolean) => void;
};

export type DialogOptions = { position?: DialogPosition; style?: CSSProperties };

export type DialogPosition = "left" | "center" | "right";

export type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type RemotePeers = { [id: string]: string };
