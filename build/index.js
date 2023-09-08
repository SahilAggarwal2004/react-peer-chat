var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import React, { useEffect, useRef } from 'react';
import useStorage from './useStorage';
import { BsFillMicFill, BsFillMicMuteFill } from './icons';
export default function Chat(_a) {
    var peerId = _a.peerId, remotePeerId = _a.remotePeerId, peerOptions = _a.peerOptions, _b = _a.onError, onError = _b === void 0 ? function () { return console.error("Can not access microphone!"); } : _b;
    var _c = __read(useStorage('rpc-audio', false, { local: true, save: true }), 2), audio = _c[0], setAudio = _c[1];
    var streamRef = useRef(null);
    var localStream = useRef();
    var handleRemoteStream = function (remoteStream) { return streamRef.current.srcObject = remoteStream; };
    useEffect(function () {
        if (!audio)
            return;
        var Peer = require('peerjs').default;
        var peer = new Peer("rpc-".concat(peerId), peerOptions);
        var call;
        peer.on('open', function () {
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            getUserMedia({
                video: false,
                audio: {
                    autoGainControl: false,
                    noiseSuppression: true,
                    echoCancellation: true
                }
            }, function (stream) {
                localStream.current = stream;
                call = peer.call("rpc-".concat(remotePeerId), stream);
                call.on('stream', handleRemoteStream);
                call.on('close', call.removeAllListeners);
                peer.on('call', function (e) {
                    call = e;
                    call.answer(stream);
                    call.on('stream', handleRemoteStream);
                    call.on('close', call.removeAllListeners);
                });
            }, onError);
        });
        return function () {
            var _a;
            (_a = localStream.current) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(function (track) { return track.stop(); });
            call === null || call === void 0 ? void 0 : call.removeAllListeners();
            call === null || call === void 0 ? void 0 : call.close();
            peer.removeAllListeners();
            peer.destroy();
        };
    }, [audio]);
    return React.createElement("button", { onClick: function () { return setAudio(function (audio) { return !audio; }); } }, audio ? React.createElement(React.Fragment, null,
        React.createElement("audio", { ref: streamRef, autoPlay: true, className: 'hidden' }),
        React.createElement(BsFillMicFill, { title: "Turn mic off" })) : React.createElement(BsFillMicMuteFill, { title: "Turn mic on" }));
}
