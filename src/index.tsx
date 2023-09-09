import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import Peer, { DataConnection, MediaConnection, PeerOptions } from 'peerjs'
import useStorage, { removeStorage } from './storage'
import { BiSolidMessageDetail, BiSolidMessageX, BsFillMicFill, BsFillMicMuteFill, GrSend } from './icons'
import './index.css'

type Message = { id: string, text: string }

type ChildrenOptions = { notification?: boolean, messages?: Message[], addMessage?: (message: Message) => void, dialogRef?: RefObject<HTMLDialogElement>, audio?: boolean, setAudio?: (audio: boolean) => void }

type DialogPosition = 'left' | 'center' | 'up'

type DialogOptions = { position: DialogPosition, style: CSSProperties }

type Props = {
    name?: string, peerId: string, remotePeerId: string, text?: boolean, voice?: boolean, peerOptions?: PeerOptions,
    dialogOptions?: DialogOptions, onError?: () => void,
    children?: ReactNode | ((childrenOptions: ChildrenOptions) => ReactNode)
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export default function Chat({
    name, peerId, remotePeerId, peerOptions, text = true, voice = true,
    dialogOptions, onError = () => console.error("Can not access microphone!"),
    children, ...props
}: Props) {
    const [peer, setPeer] = useState<Peer>();
    const [opponentName, setOpponentName] = useState<string>();
    const [notification, setNotification] = useState(false)
    const [messages, setMessages] = useStorage<Message[]>('rpc-messages', [], { save: true })
    const connRef = useRef<DataConnection>()
    const [dialog, setDialog] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true })
    const streamRef = useRef<HTMLMediaElement>(null);
    const localStream = useRef<MediaStream>();

    remotePeerId = `rpc-${remotePeerId}`

    const handleRemoteStream = (remoteStream: MediaStream) => streamRef.current!.srcObject = remoteStream

    function addMessage(message: Message, send: boolean = false) {
        setMessages(old => old.concat(message))
        if (send) connRef.current?.send({ type: 'message', message })
        else if (!dialogRef.current?.open) setNotification(true)
    }

    function handleConnection(conn: DataConnection, setName: boolean = false) {
        if (setName) setOpponentName(conn.metadata || 'Anonymous User')
        connRef.current = conn
        conn.on('open', () => {
            conn.send({ type: 'messages', messages })
            conn.on('data', ({ type, message, messages }: any) => {
                if (type === 'message') addMessage(message)
                else if (type === 'messages') {
                    setMessages(old => {
                        if (messages.length > old.length) return messages
                        return old
                    })
                }
            })
        })
    }

    useEffect(() => {
        if (!text && !audio) {
            setPeer(undefined);
            return
        }
        (async function loadPeer() {
            const Peer = (await import('peerjs')).default;
            const peer = new Peer(`rpc-${peerId}`, peerOptions)
            setPeer(peer)
        })();
    }, [audio])

    useEffect(() => {
        if (!peer) return
        let call: MediaConnection;
        peer.on('open', () => {
            if (text) handleConnection(peer.connect(remotePeerId, { metadata: name }), true)
            if (audio) {
                // @ts-ignore
                const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                getUserMedia({
                    video: false,
                    audio: {
                        autoGainControl: false, // Disable automatic gain control
                        noiseSuppression: true, // Enable noise suppression
                        echoCancellation: true // Enable echo cancellation
                    }
                }, (stream: MediaStream) => {
                    localStream.current = stream
                    call = peer.call(remotePeerId, stream);
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners)
                    peer.on('call', e => {
                        call = e
                        call.answer(stream) // Answer the call with an A/V stream.
                        call.on('stream', handleRemoteStream);
                        call.on('close', call.removeAllListeners)
                    })
                }, onError);
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
    }, [dialog, opponentName, messages]);

    return <div className='main' {...props}>
        {typeof children === 'function' ? children({ notification, messages, addMessage, dialogRef, audio, setAudio }) : <>
            {text && <div>
                {dialog ? <BiSolidMessageX onClick={() => setDialog(false)} />
                    : <div className='notification'>
                        <BiSolidMessageDetail onClick={() => {
                            setNotification(false);
                            setDialog(true);
                        }} />
                        {notification && <span className='badge' />}
                    </div>}
                <dialog ref={dialogRef} className={`${dialog ? 'dialog' : ''} position-${dialogOptions?.position || 'center'}`} style={dialogOptions?.style}>
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
                            e.preventDefault()
                            const text = inputRef.current?.value
                            if (text) {
                                inputRef.current.value = ''
                                addMessage({ id: peerId, text }, true)
                            }
                        }}>
                            <input ref={inputRef} className='input' placeholder='Enter a message' />
                            <button type='submit'><GrSend /></button>
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

export const cleanStorage = () => removeStorage('rpc-messages')