// import React, { useEffect, useRef, useState } from 'react'
import React, { useEffect, useRef } from 'react'
import useStorage from './useStorage'
import { BsFillMicFill, BsFillMicMuteFill } from './icons'
import { MediaConnection, PeerOptions } from '../node_modules/peerjs/dist/types'

type Id = string | number

type Props = { peerId: Id, remotePeerId: Id, peerOptions?: PeerOptions, onError?: () => void }

export default function Chat({
    peerId, remotePeerId,
    peerOptions = {},
    onError = () => console.error("Can not access microphone!")
}: Props) {
    const [audio, setAudio] = useStorage('rpc-audio', false, { local: true, save: true })
    // const [messages, setMessages] = useStorage<{ name: string, text: string }[]>('rpc-messages', [], { save: true })
    // const [notification, setNotification] = useState(false)
    const streamRef = useRef<HTMLMediaElement>(null);
    const localStream = useRef<MediaStream>();

    const handleRemoteStream = (remoteStream: MediaStream) => streamRef.current!.srcObject = remoteStream

    useEffect(() => {
        if (!audio) return
        const Peer = require('peerjs').default
        const peer = new Peer(`rpc-${peerId}`, peerOptions)
        let call: MediaConnection;
        peer.on('open', () => {
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
                call = peer.call(`rpc-${remotePeerId}`, stream);
                call.on('stream', handleRemoteStream);
                call.on('close', call.removeAllListeners)
                peer.on('call', (e: MediaConnection) => {
                    call = e
                    call.answer(stream) // Answer the call with an A/V stream.
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners)
                })
            }, onError);
        })
        return () => {
            localStream.current?.getTracks().forEach(track => track.stop());
            call?.removeAllListeners()
            call?.close()
            peer.removeAllListeners()
            peer.destroy()
        }
    }, [audio])

    return <button onClick={() => setAudio(audio => !audio)}>
        {audio ? <>
            <audio ref={streamRef} autoPlay className='hidden' />
            <BsFillMicFill title="Turn mic off" />
        </> : <BsFillMicMuteFill title="Turn mic on" />}
    </button>
}