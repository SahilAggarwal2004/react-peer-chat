import React, { useEffect, useRef, useState } from 'react';
import useStorage, { removeStorage } from './storage.js';
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons.js';
function closeConnection(conn) {
    conn.removeAllListeners();
    conn.close();
}
export default function Chat({ name, peerId, remotePeerId = [], peerOptions, text = true, voice = true, dialogOptions, onError = () => alert("Microphone not accessible!"), children, props = {} }) {
    const [peer, setPeer] = useState();
    const [notification, setNotification] = useState(false);
    const [remotePeers, setRemotePeers] = useStorage('rpc-remote-peer', {}, { save: true });
    const [messages, setMessages] = useStorage('rpc-messages', [], { save: true });
    const connRef = useRef({});
    const [dialog, setDialog] = useState(false);
    const dialogRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true });
    const streamRef = useRef(null);
    const localStream = useRef();
    peerId = `rpc-${peerId}`;
    if (typeof remotePeerId === 'string')
        remotePeerId = [remotePeerId];
    const remotePeerIds = remotePeerId.map(id => `rpc-${id}`);
    const handleRemoteStream = (remoteStream) => streamRef.current.srcObject = remoteStream;
    function addMessage(message, sendToRemotePeer = false) {
        var _a;
        setMessages(prev => prev.concat(message));
        if (sendToRemotePeer)
            Object.values(connRef.current).forEach(conn => conn.send({ type: 'message', message }));
        else if (!((_a = dialogRef.current) === null || _a === void 0 ? void 0 : _a.open))
            setNotification(true);
    }
    function handleConnection(conn) {
        connRef.current[conn.peer] = conn;
        conn.on('open', () => {
            conn.on('data', ({ type, message, remotePeerName }) => {
                if (type === 'message')
                    addMessage(message);
                else if (type === 'init')
                    setRemotePeers(prev => {
                        prev[conn.peer] = remotePeerName || 'Anonymous User';
                        return prev;
                    });
            });
            conn.send({ type: 'init', remotePeerName: name });
        });
        conn.on('close', conn.removeAllListeners);
    }
    useEffect(() => {
        if (!text && !audio) {
            setPeer(undefined);
            return;
        }
        (async function () {
            const { Peer } = await import('peerjs');
            const peer = new Peer(peerId, peerOptions);
            setPeer(peer);
        })();
    }, [audio]);
    useEffect(() => {
        if (!peer)
            return;
        let calls = {};
        peer.on('open', () => {
            remotePeerIds.forEach(id => {
                if (text)
                    handleConnection(peer.connect(id));
            });
            if (audio) {
                const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                try {
                    getUserMedia({
                        video: false,
                        audio: {
                            autoGainControl: false,
                            noiseSuppression: true,
                            echoCancellation: true
                        }
                    }, (stream) => {
                        localStream.current = stream;
                        remotePeerIds.forEach(id => {
                            const call = peer.call(id, stream);
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners);
                            calls[id] = call;
                        });
                        peer.on('call', call => {
                            call.answer(stream);
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners);
                            calls[call.peer] = call;
                        });
                    }, onError);
                }
                catch (_a) {
                    onError();
                }
            }
        });
        peer.on('connection', handleConnection);
        return () => {
            var _a;
            (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => track.stop());
            Object.values(connRef.current).forEach(closeConnection);
            connRef.current = {};
            Object.values(calls).forEach(closeConnection);
            peer.removeAllListeners();
            peer.destroy();
        };
    }, [peer]);
    useEffect(() => {
        var _a, _b;
        if (dialog)
            (_a = dialogRef.current) === null || _a === void 0 ? void 0 : _a.show();
        else
            (_b = dialogRef.current) === null || _b === void 0 ? void 0 : _b.close();
    }, [dialog]);
    useEffect(() => {
        const container = containerRef.current;
        if (container)
            container.scrollTop = container.scrollHeight;
    }, [dialog, remotePeers, messages]);
    return React.createElement("div", Object.assign({ className: 'rpc-main rpc-font' }, props),
        typeof children === 'function' ? children({ remotePeers, messages, addMessage, audio, setAudio }) : React.createElement(React.Fragment, null,
            text && React.createElement("div", { className: 'rpc-dialog-container' },
                dialog ? React.createElement(BiSolidMessageX, { title: 'Close chat', onClick: () => setDialog(false) }) : React.createElement("div", { className: 'rpc-notification' },
                    React.createElement(BiSolidMessageDetail, { title: 'Open chat', onClick: () => {
                            setNotification(false);
                            setDialog(true);
                        } }),
                    notification && React.createElement("span", { className: 'rpc-badge' })),
                React.createElement("dialog", { ref: dialogRef, className: `${dialog ? 'rpc-dialog' : ''} rpc-position-${(dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.position) || 'center'}`, style: dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.style },
                    React.createElement("div", { className: 'rpc-heading' }, "Chat"),
                    React.createElement("hr", { className: 'rpc-hr' }),
                    React.createElement("div", null,
                        React.createElement("div", { ref: containerRef, className: 'rpc-message-container' }, messages.map(({ id, text }, i) => React.createElement("div", { key: i },
                            React.createElement("strong", null,
                                id === peerId ? 'You' : remotePeers[id],
                                ": "),
                            React.createElement("span", null, text)))),
                        React.createElement("hr", { className: 'rpc-hr' }),
                        React.createElement("form", { className: 'rpc-input-container', onSubmit: e => {
                                var _a;
                                e.preventDefault();
                                const text = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.value;
                                if (text) {
                                    inputRef.current.value = '';
                                    addMessage({ id: peerId, text }, true);
                                }
                            } },
                            React.createElement("input", { ref: inputRef, className: 'rpc-input rpc-font', placeholder: 'Enter a message' }),
                            React.createElement("button", { type: 'submit', className: 'rpc-button' },
                                React.createElement(GrSend, { title: 'Send message' })))))),
            voice && React.createElement("div", null, audio ? React.createElement(BsFillMicFill, { title: "Turn mic off", onClick: () => setAudio(false) }) : React.createElement(BsFillMicMuteFill, { title: "Turn mic on", onClick: () => setAudio(true) }))),
        voice && audio && React.createElement("audio", { ref: streamRef, autoPlay: true, style: { display: 'none' } }));
}
export const clearChat = () => {
    removeStorage('rpc-remote-peer');
    removeStorage('rpc-messages');
};
