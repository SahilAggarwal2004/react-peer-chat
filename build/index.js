import React, { useEffect, useRef, useState } from 'react';
import useStorage, { removeStorage } from './storage.js';
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons.js';
export default function Chat({ name, peerId, remotePeerId, peerOptions, text = true, voice = true, dialogOptions, onError = () => console.error("Can not access microphone!"), children, ...props }) {
    const [peer, setPeer] = useState();
    const [opponentName, setOpponentName] = useState();
    const [notification, setNotification] = useState(false);
    const [messages, setMessages] = useStorage('rpc-messages', [], { save: true });
    const connRef = useRef();
    const [dialog, setDialog] = useState(false);
    const dialogRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true });
    const streamRef = useRef(null);
    const localStream = useRef();
    const handleRemoteStream = (remoteStream) => streamRef.current.srcObject = remoteStream;
    function addMessage(message, sendToRemotePeer = false) {
        var _a, _b;
        setMessages(old => old.concat(message));
        if (sendToRemotePeer)
            (_a = connRef.current) === null || _a === void 0 ? void 0 : _a.send({ type: 'message', message });
        else if (!((_b = dialogRef.current) === null || _b === void 0 ? void 0 : _b.open))
            setNotification(true);
    }
    function handleConnection(conn, setName = false) {
        if (setName)
            setOpponentName(conn.metadata || 'Anonymous User');
        connRef.current = conn;
        conn.on('open', () => {
            conn.send({ type: 'messages', messages });
            conn.on('data', ({ type, message, messages }) => {
                if (type === 'message')
                    addMessage(message);
                else if (type === 'messages') {
                    setMessages(old => {
                        if (messages.length > old.length)
                            return messages;
                        return old;
                    });
                }
            });
        });
    }
    useEffect(() => {
        if (!text && !audio) {
            setPeer(undefined);
            return;
        }
        (async function loadPeer() {
            const { Peer } = await import('peerjs');
            const peer = new Peer(`rpc-${peerId}`, peerOptions);
            setPeer(peer);
        })();
    }, [audio]);
    useEffect(() => {
        if (!peer)
            return;
        let call;
        peer.on('open', () => {
            if (remotePeerId) {
                remotePeerId = `rpc-${remotePeerId}`;
                if (text)
                    handleConnection(peer.connect(remotePeerId, { metadata: name }), true);
            }
            if (audio) {
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
                    if (remotePeerId) {
                        call = peer.call(remotePeerId, stream);
                        call.on('stream', handleRemoteStream);
                        call.on('close', call.removeAllListeners);
                    }
                    peer.on('call', e => {
                        call = e;
                        call.answer(stream);
                        call.on('stream', handleRemoteStream);
                        call.on('close', call.removeAllListeners);
                    });
                }, onError);
            }
        });
        peer.on('connection', handleConnection);
        return () => {
            var _a, _b, _c;
            (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => track.stop());
            (_b = connRef.current) === null || _b === void 0 ? void 0 : _b.removeAllListeners();
            (_c = connRef.current) === null || _c === void 0 ? void 0 : _c.close();
            call === null || call === void 0 ? void 0 : call.removeAllListeners();
            call === null || call === void 0 ? void 0 : call.close();
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
    }, [dialog, opponentName, messages]);
    return React.createElement("div", { className: 'rpc-main', ...props },
        typeof children === 'function' ? children({ opponentName, messages, addMessage, audio, setAudio }) : React.createElement(React.Fragment, null,
            text && React.createElement("div", null,
                dialog ? React.createElement(BiSolidMessageX, { onClick: () => setDialog(false) })
                    : React.createElement("div", { className: 'rpc-notification' },
                        React.createElement(BiSolidMessageDetail, { onClick: () => {
                                setNotification(false);
                                setDialog(true);
                            } }),
                        notification && React.createElement("span", { className: 'rpc-badge' })),
                React.createElement("dialog", { ref: dialogRef, className: `${dialog ? 'rpc-dialog' : ''} rpc-position-${(dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.position) || 'center'}`, style: dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.style },
                    React.createElement("div", { className: 'rpc-heading' }, "Chat"),
                    React.createElement("hr", null),
                    React.createElement("div", null,
                        React.createElement("div", { ref: containerRef, className: 'rpc-message-container' }, opponentName && messages.map(({ id, text }, i) => React.createElement("div", { key: i },
                            React.createElement("strong", null,
                                id === peerId ? 'You' : opponentName,
                                ": "),
                            React.createElement("span", null, text)))),
                        React.createElement("hr", null),
                        React.createElement("form", { className: 'rpc-input-container', onSubmit: e => {
                                var _a;
                                e.preventDefault();
                                const text = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.value;
                                if (text) {
                                    inputRef.current.value = '';
                                    addMessage({ id: peerId, text }, true);
                                }
                            } },
                            React.createElement("input", { ref: inputRef, className: 'rpc-input', placeholder: 'Enter a message' }),
                            React.createElement("button", { type: 'submit' },
                                React.createElement(GrSend, null)))))),
            voice && React.createElement("div", null, audio ? React.createElement(BsFillMicFill, { title: "Turn mic off", onClick: () => setAudio(false) }) : React.createElement(BsFillMicMuteFill, { title: "Turn mic on", onClick: () => setAudio(true) }))),
        voice && audio && React.createElement("audio", { ref: streamRef, autoPlay: true, style: { display: 'none' } }));
}
export const clearChat = () => removeStorage('rpc-messages');
