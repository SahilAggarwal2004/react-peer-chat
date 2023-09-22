import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react'
import { Peer, DataConnection, MediaConnection, PeerOptions as ImportedPeerOptions } from 'peerjs'
import useStorage, { removeStorage } from './storage.js'
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons.js'

export type RemotePeerId = string | string[]

export type PeerOptions = ImportedPeerOptions

export type DialogPosition = 'left' | 'center' | 'right'

export interface DialogOptions {
    position?: DialogPosition
    style?: CSSProperties
}

type RemotePeers = { [id: string]: string }

export interface Message {
    id: string
    text: string
}

export interface ChildrenOptions {
    remotePeers?: RemotePeers
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
    remotePeerId?: RemotePeerId
    text?: boolean
    voice?: boolean
    peerOptions?: PeerOptions
    dialogOptions?: DialogOptions
    onError?: Function
    onMicError?: Function
    children?: Children
    props?: Props
}

export type { IconProps } from './icons.js'

function closeConnection(conn: DataConnection | MediaConnection) {
    conn.removeAllListeners()
    conn.close()
}

export default function Chat({
    name, peerId, remotePeerId = [], peerOptions, text = true, voice = true, dialogOptions,
    onError = () => alert('Browser not supported! Try some other browser.'),
    onMicError = () => alert('Microphone not accessible!'),
    children, props = {}
}: ChatProps) {
    const [peer, setPeer] = useState<Peer>();
    const [notification, setNotification] = useState(false)
    const [remotePeers, setRemotePeers] = useStorage<RemotePeers>('rpc-remote-peer', {}, { save: true });
    const [messages, setMessages] = useStorage<Message[]>('rpc-messages', [], { save: true })
    const connRef = useRef<{ [id: string]: DataConnection }>({})
    const [dialog, setDialog] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true })
    const streamRef = useRef<HTMLMediaElement>(null);
    const localStream = useRef<MediaStream>();

    peerId = `rpc-${peerId}`
    if (typeof remotePeerId === 'string') remotePeerId = [remotePeerId]
    const remotePeerIds = remotePeerId.map(id => `rpc-${id}`)

    const handleRemoteStream = (remoteStream: MediaStream) => streamRef.current!.srcObject = remoteStream

    function addMessage(message: Message, sendToRemotePeer: boolean = false) {
        setMessages(prev => prev.concat(message))
        if (sendToRemotePeer) Object.values(connRef.current).forEach(conn => conn.send({ type: 'message', message }))
        else if (!dialogRef.current?.open) setNotification(true)
    }

    function handleConnection(conn: DataConnection) {
        connRef.current[conn.peer] = conn
        conn.on('open', () => {
            conn.on('data', ({ type, message, remotePeerName }: any) => {
                if (type === 'message') addMessage(message)
                else if (type === 'init') setRemotePeers(prev => {
                    prev[conn.peer] = remotePeerName || 'Anonymous User'
                    return prev
                })
            })
            conn.send({ type: 'init', remotePeerName: name })
        })
        conn.on('close', conn.removeAllListeners)
    }

    useEffect(() => {
        if (!text && !audio) {
            setPeer(undefined);
            return
        }
        (async function () {
            const { Peer, util: { supports: { audioVideo, data } } } = await import('peerjs');
            if (!data || !audioVideo) return onError()
            const peer = new Peer(peerId, peerOptions)
            setPeer(peer)
        })();
    }, [audio])

    useEffect(() => {
        if (!peer) return
        let calls: { [id: string]: MediaConnection } = {};
        peer.on('open', () => {
            remotePeerIds.forEach(id => {
                if (text) handleConnection(peer.connect(id))
            })
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
                        remotePeerIds.forEach(id => {
                            const call = peer.call(id, stream);
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners)
                            calls[id] = call
                        })
                        peer.on('call', call => {
                            call.answer(stream) // Answer the call with an A/V stream.
                            call.on('stream', handleRemoteStream);
                            call.on('close', call.removeAllListeners)
                            calls[call.peer] = call
                        })
                    }, onMicError);
                } catch { onMicError() }
            }
        })

        peer.on('connection', handleConnection)

        return () => {
            localStream.current?.getTracks().forEach(track => track.stop());
            Object.values(connRef.current).forEach(closeConnection)
            connRef.current = {}
            Object.values(calls).forEach(closeConnection)
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
    }, [dialog, remotePeers, messages]);

    return <div className='rpc-main rpc-font' {...props}>
        {typeof children === 'function' ? children({ remotePeers, messages, addMessage, audio, setAudio }) : <>
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
                                <strong>{id === peerId ? 'You' : remotePeers[id]}: </strong>
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
                {audio ? <BsFillMicFill title='Turn mic off' onClick={() => setAudio(false)} /> : <BsFillMicMuteFill title='Turn mic on' onClick={() => setAudio(true)} />}
            </div>}
        </>}
        {voice && audio && <audio ref={streamRef} autoPlay style={{ display: 'none' }} />}
    </div>
}

export const clearChat = () => {
    removeStorage('rpc-remote-peer')
    removeStorage('rpc-messages')
}