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
    remotePeerId = `rpc-${remotePeerId}`;
    const handleRemoteStream = (remoteStream) => streamRef.current.srcObject = remoteStream;
    function addMessage(message, send = false) {
        setMessages(old => old.concat(message));
        if (send)
            connRef.current?.send({ type: 'message', message });
        else if (!dialogRef.current?.open)
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
            if (text)
                handleConnection(peer.connect(remotePeerId, { metadata: name }), true);
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
                    call = peer.call(remotePeerId, stream);
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners);
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
            localStream.current?.getTracks().forEach(track => track.stop());
            connRef.current?.removeAllListeners();
            connRef.current?.close();
            call?.removeAllListeners();
            call?.close();
            peer.removeAllListeners();
            peer.destroy();
        };
    }, [peer]);
    useEffect(() => {
        if (dialog)
            dialogRef.current?.show();
        else
            dialogRef.current?.close();
    }, [dialog]);
    useEffect(() => {
        const container = containerRef.current;
        if (container)
            container.scrollTop = container.scrollHeight;
    }, [dialog, opponentName, messages]);
    return React.createElement("div", { className: 'rpc-main', ...props },
        typeof children === 'function' ? children({ notification, messages, addMessage, dialogRef, audio, setAudio }) : React.createElement(React.Fragment, null,
            text && React.createElement("div", null,
                dialog ? React.createElement(BiSolidMessageX, { onClick: () => setDialog(false) })
                    : React.createElement("div", { className: 'rpc-notification' },
                        React.createElement(BiSolidMessageDetail, { onClick: () => {
                                setNotification(false);
                                setDialog(true);
                            } }),
                        notification && React.createElement("span", { className: 'rpc-badge' })),
                React.createElement("dialog", { ref: dialogRef, className: `${dialog ? 'rpc-dialog' : ''} rpc-position-${dialogOptions?.position || 'center'}`, style: dialogOptions?.style },
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
                                e.preventDefault();
                                const text = inputRef.current?.value;
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
