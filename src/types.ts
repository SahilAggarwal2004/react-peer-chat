import { PeerOptions } from "peerjs";
import { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

// hooks.tsx
export type Message = { id: string; text: string };

export type MessageEvent = (message: Message) => void;

export type { PeerOptions };

export type RemotePeerId = string | string[];

export type useChatProps = {
  name?: string;
  peerId: string;
  remotePeerId?: RemotePeerId;
  text?: boolean;
  recoverChat?: boolean;
  audio?: boolean;
  peerOptions?: PeerOptions;
  onError?: Function;
  onMicError?: Function;
  onMessageSent?: MessageEvent;
  onMessageReceived?: MessageEvent;
};

// icons.tsx
export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

// index.tsx
export type RemotePeers = { [id: string]: string };

export type Children = (childrenOptions: ChildrenOptions) => ReactNode;

export type ChildrenOptions = {
  remotePeers?: RemotePeers;
  messages?: Message[];
  sendMessage?: (message: Message) => void;
  audio?: boolean;
  setAudio?: (audio: boolean) => void;
};

export type ChatProps = useChatProps & {
  dialogOptions?: DialogOptions;
  props?: DivProps;
  children?: Children;
};

export type DialogOptions = { position?: DialogPosition; style?: CSSProperties };

export type DialogPosition = "left" | "center" | "right";

export type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

// storage.ts
