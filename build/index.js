import React, { useEffect, useRef } from 'react';
import useStorage from './useStorage';
import { BsFillMicFill, BsFillMicMuteFill } from './icons';
export default function Chat({ peerId, remotePeerId, peerOptions, onError = () => console.error("Can not access microphone!") }) {
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true });
    const streamRef = useRef(null);
    const localStream = useRef();
    const handleRemoteStream = (remoteStream) => streamRef.current.srcObject = remoteStream;
    useEffect(() => {
        if (!audio)
            return;
        const Peer = require('peerjs').default;
        const peer = new Peer(`rpc-${peerId}`, peerOptions);
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
            localStream.current?.getTracks().forEach(track => track.stop());
            call?.removeAllListeners();
            call?.close();
            peer.removeAllListeners();
            peer.destroy();
        };
    }, [audio]);
    return React.createElement("button", { onClick: () => setAudio(audio => !audio) }, audio ? React.createElement(React.Fragment, null,
        React.createElement("audio", { ref: streamRef, autoPlay: true, className: 'hidden' }),
        React.createElement(BsFillMicFill, { title: "Turn mic off" })) : React.createElement(BsFillMicMuteFill, { title: "Turn mic on" }));
}
