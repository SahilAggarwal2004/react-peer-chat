import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { PeerOptions } from 'peerjs';
type Message = {
    id: string;
    text: string;
};
type ChildrenOptions = {
    remotePeer?: string;
    messages?: Message[];
    addMessage?: (message: Message, sendToRemotePeer?: boolean) => void;
    audio?: boolean;
    setAudio?: (audio: boolean) => void;
};
type DialogPosition = 'left' | 'center' | 'right';
type DialogOptions = {
    position: DialogPosition;
    style: CSSProperties;
};
type Props = {
    name?: string;
    peerId: string;
    remotePeerId?: string;
    text?: boolean;
    voice?: boolean;
    peerOptions?: PeerOptions;
    dialogOptions?: DialogOptions;
    onError?: () => void;
    children?: (childrenOptions: ChildrenOptions) => ReactNode;
    props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
};
export default function Chat({ name, peerId, remotePeerId, peerOptions, text, voice, dialogOptions, onError, children, props }: Props): React.JSX.Element;
export declare const clearChat: () => void;
export {};
