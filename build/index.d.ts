import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode, RefObject } from 'react';
import { PeerOptions } from 'peerjs';
type Message = {
    id: string;
    text: string;
};
type ChildrenOptions = {
    notification?: boolean;
    messages?: Message[];
    addMessage?: (message: Message) => void;
    dialogRef?: RefObject<HTMLDialogElement>;
    audio?: boolean;
    setAudio?: (audio: boolean) => void;
};
type DialogPosition = 'left' | 'center' | 'up';
type DialogOptions = {
    position: DialogPosition;
    style: CSSProperties;
};
type Props = {
    name?: string;
    peerId: string;
    remotePeerId: string;
    text?: boolean;
    voice?: boolean;
    peerOptions?: PeerOptions;
    dialogOptions?: DialogOptions;
    onError?: () => void;
    children?: ReactNode | ((childrenOptions: ChildrenOptions) => ReactNode);
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export default function Chat({ name, peerId, remotePeerId, peerOptions, text, voice, dialogOptions, onError, children, ...props }: Props): React.JSX.Element;
export declare const clearChat: () => void;
export {};
