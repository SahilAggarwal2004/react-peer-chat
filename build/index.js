var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useEffect, useRef, useState } from 'react';
import useStorage from './useStorage';
import { BsFillMicFill, BsFillMicMuteFill } from './icons';
export default function Chat({ peerId, remotePeerId, peerOptions, onError = () => console.error("Can not access microphone!") }) {
    const [peer, setPeer] = useState();
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true });
    const streamRef = useRef(null);
    const localStream = useRef();
    const handleRemoteStream = (remoteStream) => streamRef.current.srcObject = remoteStream;
    useEffect(() => {
        if (!audio) {
            setPeer(undefined);
            return;
        }
        (function loadPeer() {
            return __awaiter(this, void 0, void 0, function* () {
                const Peer = (yield import('peerjs')).default;
                const peer = new Peer(`rpc-${peerId}`, peerOptions);
                setPeer(peer);
            });
        })();
    }, [audio]);
    useEffect(() => {
        if (!peer)
            return;
        let call;
        peer.on('open', () => {
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({
                video: false,
                audio: {
                    autoGainControl: false,
                    noiseSuppression: true,
                    echoCancellation: true
                }
            }, (stream) => {
                localStream.current = stream;
                call = peer.call(`rpc-${remotePeerId}`, stream);
                call.on('stream', handleRemoteStream);
                call.on('close', call.removeAllListeners);
                peer.on('call', (e) => {
                    call = e;
                    call.answer(stream);
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners);
                });
            }, onError);
        });
        return () => {
            var _a;
            (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => track.stop());
            call === null || call === void 0 ? void 0 : call.removeAllListeners();
            call === null || call === void 0 ? void 0 : call.close();
            peer.removeAllListeners();
            peer.destroy();
        };
    }, [peer]);
    return React.createElement("button", { onClick: () => setAudio(audio => !audio) }, audio ? React.createElement(React.Fragment, null,
        React.createElement("audio", { ref: streamRef, autoPlay: true, className: 'hidden' }),
        React.createElement(BsFillMicFill, { title: "Turn mic off" })) : React.createElement(BsFillMicMuteFill, { title: "Turn mic on" }));
}
