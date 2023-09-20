import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import { Peer, DataConnection, MediaConnection, PeerOptions as ImportedPeerOptions } from 'peerjs'
import useStorage, { removeStorage } from './storage.js'
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons.js'

export type PeerOptions = ImportedPeerOptions

export type DialogPosition = 'left' | 'center' | 'right'

export interface DialogOptions {
    position?: DialogPosition
    style?: CSSProperties
}

export interface Message {
    id: string
    text: string
}

export interface ChildrenOptions {
    remotePeerName?: string
    messages?: Message[]
    addMessage?: (message: Message, sendToRemotePeer?: boolean) => void
    audio?: boolean
    setAudio?: (audio: boolean) => void
}

export type Children = (childrenOptions: ChildrenOptions) => ReactNode

export type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export interface ChatProps {
    name?: string
    peerId: string
    remotePeerId?: string
    text?: boolean
    voice?: boolean
    peerOptions?: PeerOptions
    dialogOptions?: DialogOptions
    onError?: Function
    children?: Children
    props?: Props
}

export default function Chat({
    name, peerId, remotePeerId, peerOptions, text = true, voice = true,
    dialogOptions, onError = () => alert("Microphone not accessible!"),
    children, props = {}
}: ChatProps) {
    const [peer, setPeer] = useState<Peer>();
    const [notification, setNotification] = useState(false)
    const [remotePeerName, setRemotePeer] = useStorage<string>('rpc-remote-peer', '', { save: true });
    const [messages, setMessages] = useStorage<Message[]>('rpc-messages', [], { save: true })
    const connRef = useRef<DataConnection>()
    const [dialog, setDialog] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true })
    const streamRef = useRef<HTMLMediaElement>(null);
    const localStream = useRef<MediaStream>();

    const handleRemoteStream = (remoteStream: MediaStream) => streamRef.current!.srcObject = remoteStream

    function addMessage(message: Message, sendToRemotePeer: boolean = false) {
        setMessages(old => old.concat(message))
        if (sendToRemotePeer) connRef.current?.send({ type: 'message', message })
        else if (!dialogRef.current?.open) setNotification(true)
    }

    function handleConnection(conn: DataConnection) {
        connRef.current = conn
        conn.on('open', () => {
            conn.on('data', ({ type, message, remotePeerName, messages }: any) => {
                if (type === 'message') addMessage(message)
                else if (type === 'init') {
                    setRemotePeer(remotePeerName || 'Anonymous User')
                    setMessages(old => {
                        if (messages.length > old.length) return messages
                        return old
                    })
                }
            })
            conn.send({ type: 'init', remotePeerName: name, messages })
        })
    }

    useEffect(() => {
        if (!text && !audio) {
            setPeer(undefined);
            return
        }
        (async function loadPeer() {
            const { Peer } = await import('peerjs');
            const peer = new Peer(`rpc-${peerId}`, peerOptions)
            setPeer(peer)
        })();
    }, [audio])

    useEffect(() => {
        if (!peer) return
        let call: MediaConnection;
        peer.on('open', () => {
            if (remotePeerId) {
                remotePeerId = `rpc-${remotePeerId}`
                if (text) handleConnection(peer.connect(remotePeerId, { metadata: name }))
            }
            if (audio) {
                // @ts-ignore
                const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                try {
                    getUserMedia({
                        video: false,
                        audio: {
                            autoGainControl: false, // Disable automatic gain control
                            noiseSuppression: true, // Enable noise suppression
                            echoCancellation: true // Enable echo cancellation
                        }
                    }, (stream: MediaStream) => {
                        localStream.current = stream
                        if (remotePeerId) {
                            call = peer.call(remotePeerId, stream);
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners)
                        }
                        peer.on('call', e => {
                            call = e
                            call.answer(stream) // Answer the call with an A/V stream.
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners)
                        })
                    }, onError);
                } catch { onError() }
            }
        })

        peer.on('connection', handleConnection)

        return () => {
            localStream.current?.getTracks().forEach(track => track.stop());
            connRef.current?.removeAllListeners()
            connRef.current?.close()
            call?.removeAllListeners()
            call?.close()
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [peer])

    useEffect(() => {
        if (dialog) dialogRef.current?.show()
        else dialogRef.current?.close()
    }, [dialog])

    useEffect(() => {
        const container = containerRef.current
        if (container) container.scrollTop = container.scrollHeight
    }, [dialog, remotePeerName, messages]);

    return <div className='rpc-main rpc-font' {...props}>
        {typeof children === 'function' ? children({ remotePeerName, messages, addMessage, audio, setAudio }) : <>
            {text && <div className='rpc-dialog-container'>
                {dialog ? <BiSolidMessageX title='Close chat' onClick={() => setDialog(false)} /> : <div className='rpc-notification'>
                    <BiSolidMessageDetail title='Open chat' onClick={() => {
                        setNotification(false);
                        setDialog(true);
                    }} />
                    {notification && <span className='rpc-badge' />}
                </div>}
                <dialog ref={dialogRef} className={`${dialog ? 'rpc-dialog' : ''} rpc-position-${dialogOptions?.position || 'center'}`} style={dialogOptions?.style}>
                    <div className='rpc-heading'>Chat</div>
                    <hr className='rpc-hr' />
                    <div>
                        <div ref={containerRef} className='rpc-message-container'>
                            {messages.map(({ id, text }, i) => <div key={i}>
                                <strong>{id === peerId ? 'You' : remotePeerName}: </strong>
                                <span>{text}</span>
                            </div>)}
                        </div>
                        <hr className='rpc-hr' />
                        <form className='rpc-input-container' onSubmit={e => {
                            e.preventDefault()
                            const text = inputRef.current?.value
                            if (text) {
                                inputRef.current.value = ''
                                addMessage({ id: peerId, text }, true)
                            }
                        }}>
                            <input ref={inputRef} className='rpc-input rpc-font' placeholder='Enter a message' />
                            <button type='submit' className='rpc-button'><GrSend title='Send message' /></button>
                        </form>
                    </div>
                </dialog>
            </div>}
            {voice && <div>
                {audio ? <BsFillMicFill title="Turn mic off" onClick={() => setAudio(false)} /> : <BsFillMicMuteFill title="Turn mic on" onClick={() => setAudio(true)} />}
            </div>}
        </>}
        {voice && audio && <audio ref={streamRef} autoPlay style={{ display: 'none' }} />}
    </div>
}

export const clearChat = () => {
    removeStorage('rpc-remote-peer')
    removeStorage('rpc-messages')
}