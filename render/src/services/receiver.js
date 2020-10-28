import events from "events";
import Stream from "./file/stream";
import PacketType from "../utils/packetType";
import PeerStatus from "../utils/peerStatus";
import RemoteConnection from "../services/remoteConnection";

const CHUNK_MTU = 16000;
const CHUNKS_PER_ACK = 64;

export default class Receiver extends events.EventEmitter {

    constructor(config) {
        super();
        this.id = null;
        this._stream = null;
        this._request = null;
        this._chunksTotal = 0;
        this._receivedChunkNum = 0;
        this._conn = new RemoteConnection(config);
    }

    accept(id, offer, callback) {
        return new Promise((resolve, reject) => {
            this.id = id;
            this._conn.on('error', err => reject(err));
            this._conn.on('connection', () => resolve());
            this._conn.on('message', (data, fn) => this._process(data, fn));
            this._conn.on('disconnected', () => this.emit('disconnected'));
            this._conn.accept(id, offer, callback);
        });
    }

    cancelReceive() {
        const packet = {
            type: PacketType.cancel_receive
        }
        this._conn.send(packet).catch(() => {
            this._statusChanged(PeerStatus.idle);
            this._emitError(new Error('取消失败'));
        });
    }

    addIceCandidate(candidate) {
        if (this._conn == null) return;
        this._conn.addIceCandidate(candidate);
    }

    _statusChanged(status) {
        this.emit('status-changed', status);
    }

    _emitMessage(message) {
        message = message || '';
        this.emit('message', message);
    }

    _process(e, fn) {
        switch (e.type) {
            case PacketType.inquire: {
                this._request = e.data;
                if (this._request.type === 'file') {
                    this._receivedChunkNum = 0;
                    this._chunksTotal = Math.ceil(this._request.size / CHUNK_MTU);
                    this._stream = new Stream(this._request.name)
                    this.emit('inquire', this._request, fn);
                    this._emitMessage();
                    this._statusChanged(PeerStatus.ringing);
                } else {
                    this.emit('inquire', this._request, fn);
                    this._emitMessage();
                    this._statusChanged(PeerStatus.ringing);
                }
                break;
            }
            case PacketType.cancel_inquire: {
                if (this._stream) {
                    this._stream.close();
                    this._stream = null;
                }
                this._chunksTotal = 0;
                this._receivedChunkNum = 0;
                this.emit('cancel-inquire');
                this._emitMessage('已取消');
                this._statusChanged(PeerStatus.idle);
                fn();
                break;
            }
            default: {
                const progress = (this._receivedChunkNum + 1) / this._chunksTotal;
                this.emit('receiving-progress', progress);
                this._emitMessage(`正在接收 ${(progress * 100).toFixed(0)}%`);
                this._stream.append(e);
                const nextChunkNum = this._receivedChunkNum + 1;
                const lastChunkInFile = this._receivedChunkNum === this._chunksTotal - 1;
                const lastChunkInBlock = this._receivedChunkNum > 0 && (this._receivedChunkNum + 1) % CHUNKS_PER_ACK === 0;
                this._receivedChunkNum++;
                if (lastChunkInFile || lastChunkInBlock) {
                    if (lastChunkInFile) {
                        this._stream.save();
                        this._statusChanged(PeerStatus.idle);
                        this._emitMessage('接收完成');
                        const arg = {
                            done: true
                        }
                        fn(arg);
                    } else {
                        const arg = {
                            next: nextChunkNum,
                            done: false
                        }
                        fn(arg);
                    }
                } else {
                    const arg = {
                        done: false
                    }
                    fn(arg);
                }
                break;
            }
        }
    }
}