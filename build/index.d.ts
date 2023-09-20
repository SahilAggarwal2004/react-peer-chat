import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';
import { PeerOptions as ImportedPeerOptions } from 'peerjs';
export type PeerOptions = ImportedPeerOptions;
export type DialogPosition = 'left' | 'center' | 'right';
export interface DialogOptions {
    position?: DialogPosition;
    style?: CSSProperties;
}
export interface Message {
    id: string;
    text: string;
}
export interface ChildrenOptions {
    remotePeerName?: string;
    messages?: Message[];
    addMessage?: (message: Message, sendToRemotePeer?: boolean) => void;
    audio?: boolean;
    setAudio?: (audio: boolean) => void;
}
export type Children = (childrenOptions: ChildrenOptions) => ReactNode;
export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export interface ChatProps {
    name?: string;
    peerId: string;
    remotePeerId?: string;
    text?: boolean;
    voice?: boolean;
    peerOptions?: PeerOptions;
    dialogOptions?: DialogOptions;
    onError?: Function;
    children?: Children;
    props?: Props;
}
export default function Chat({ name, peerId, remotePeerId, peerOptions, text, voice, dialogOptions, onError, children, props }: ChatProps): React.JSX.Element;
export declare const clearChat: () => void;
