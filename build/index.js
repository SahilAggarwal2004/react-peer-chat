var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useEffect, useRef, useState } from 'react';
import useStorage, { removeStorage } from './storage';
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons';
import './index.css';
export default function Chat(_a) {
    var { name, peerId, remotePeerId, peerOptions, text = true, voice = true, dialogOptions, onError = () => console.error("Can not access microphone!"), children } = _a, props = __rest(_a, ["name", "peerId", "remotePeerId", "peerOptions", "text", "voice", "dialogOptions", "onError", "children"]);
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
        var _a, _b;
        setMessages(old => old.concat(message));
        if (send)
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
    return <div className='main' {...props}>
        {typeof children === 'function' ? children({ notification, messages, addMessage, dialogRef, audio, setAudio }) : <>
            {text && <div>
                {dialog ? <BiSolidMessageX onClick={() => setDialog(false)}/>
                    : <div className='notification'>
                        <BiSolidMessageDetail onClick={() => {
                            setNotification(false);
                            setDialog(true);
                        }}/>
                        {notification && <span className='badge'/>}
                    </div>}
                <dialog ref={dialogRef} className={`${dialog ? 'dialog' : ''} position-${(dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.position) || 'center'}`} style={dialogOptions === null || dialogOptions === void 0 ? void 0 : dialogOptions.style}>
                    <div className='heading'>Chat</div>
                    <hr />
                    <div>
                        <div ref={containerRef} className='message-container'>
                            {opponentName && messages.map(({ id, text }, i) => <div key={i}>
                                <strong>{id === peerId ? 'You' : opponentName}: </strong>
                                <span>{text}</span>
                            </div>)}
                        </div>
                        <hr />
                        <form className='input-container' onSubmit={e => {
                    var _a;
                    e.preventDefault();
                    const text = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.value;
                    if (text) {
                        inputRef.current.value = '';
                        addMessage({ id: peerId, text }, true);
                    }
                }}>
                            <input ref={inputRef} className='input' placeholder='Enter a message'/>
                            <button type='submit'><GrSend /></button>
                        </form>
                    </div>
                </dialog>
            </div>}
            {voice && <div>
                {audio ? <BsFillMicFill title="Turn mic off" onClick={() => setAudio(false)}/> : <BsFillMicMuteFill title="Turn mic on" onClick={() => setAudio(true)}/>}
            </div>}
        </>}
        {voice && audio && <audio ref={streamRef} autoPlay style={{ display: 'none' }}/>}
    </div>;
}
export const cleanStorage = () => removeStorage('rpc-messages');
