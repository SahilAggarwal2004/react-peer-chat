import React from 'react';
import { PeerOptions } from '../node_modules/peerjs/dist/types';
type Id = string | number;
type Props = {
    peerId: Id;
    remotePeerId: Id;
    peerOptions?: PeerOptions;
    onError?: () => void;
};
export default function Chat({ peerId, remotePeerId, peerOptions, onError }: Props): React.JSX.Element;
export {};
