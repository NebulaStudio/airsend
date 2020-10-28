import events from "events";
import PacketType from "../utils/packetType";
import PeerStatus from "../utils/peerStatus";
import LocalConnection from "./localConnection";

const CHUNK_MTU = 16000;
const CHUNKS_PER_ACK = 64;

export default class Dispatcher extends events.EventEmitter {

    constructor(id, name, config) {
        super();
        this.id = id;
        this._name = name;
        this._config = config;
        this._conn = null;
        this._request = null;
        this._isCancel = false;
        this._status = PeerStatus.idle;
    }

    request(e) {
        this._isCancel = false;
        return new Promise((resolve, reject) => {
            this._createConnection(this.id).then(() => {
                this._request = e;
                if (e.type === 'text') {
                    const regex = /^[a-zA-z]+:\/\/[^\s]*/;
                    e.type = regex.test(e.data) ? 'link' : 'text';
                    this.sendText();
                    return resolve();
                } else {
                    this.sendFile();
                    return resolve();
                }
            }).catch(err => {
                this._statusChanged(PeerStatus.idle);
                this._conn.close();
                reject(err);
            });
        });
    }

    cancelRequest() {
        this._emitMessage();
        this._isCancel = true;
        if (this._status === PeerStatus.dialing) {
            this._confirmCancelRequest();
        }
    }

    _confirmCancelRequest() {
        const packet = {
            type: PacketType.cancel_inquire
        }
        this._conn.send(packet, () => {
            this._emitMessage('已取消');
            this._statusChanged(PeerStatus.idle);
            this._conn.close();
        }).catch(() => {
            this._statusChanged(PeerStatus.idle);
            this._emitError(new Error('取消失败'));
            this._conn.close();
        });
    }

    addIceCandidate(candidate) {
        if (this._conn == null) return;
        this._conn.addIceCandidate(candidate);
    }

    sendText() {
        const packet = {
            type: PacketType.inquire,
            data: this._request,
        }
        this._conn.send(packet, (e) => {
            this._statusChanged(PeerStatus.idle);
            const message = e ? '已接收' : '已取消';
            this._emitMessage(message);
            this._conn.close();
        }).then(() => {
            this._statusChanged(PeerStatus.dialing);
            this._emitMessage('等待响应');
        }).catch(() => {
            this._statusChanged(PeerStatus.idle);
            this._emitError(new Error('发送数据失败'));
            this._conn.close();
        });
    }

    sendFile() {
        const packet = {
            type: PacketType.inquire,
            data: this._request
        }
        this._conn.send(packet, (e) => {
            if (e) {
                this._statusChanged(PeerStatus.sending);
                this._emitMessage('同意接收');
                this._sendBlock(0);
            } else {
                this._statusChanged(PeerStatus.idle);
                this._emitMessage('拒绝接收');
                this._conn.close();
            }
        }).then(() => {
            this._statusChanged(PeerStatus.dialing);
            this._emitMessage('等待响应');
        }).catch(() => {
            this._statusChanged(PeerStatus.idle);
            this._emitError(new Error('发送数据失败'));
            this._conn.close();
        });
    }

    _sendBlock(beginChunkNum) {
        const source = this._request.data;
        const chunksTotal = Math.ceil(this._request.size / CHUNK_MTU);
        const remainingChunks = chunksTotal - beginChunkNum;
        const chunksToSend = Math.min(remainingChunks, CHUNKS_PER_ACK);
        const endChunkNum = beginChunkNum + chunksToSend - 1;
        const blockBegin = beginChunkNum * CHUNK_MTU;
        const blockEnd = endChunkNum * CHUNK_MTU + CHUNK_MTU;
        const blockBlob = source.slice(blockBegin, blockEnd);
        const reader = new FileReader();
        let chunkNum;
        reader.onload = async event => {
            if (reader.readyState !== FileReader.DONE) return;
            const blockBuffer = event.target.result;
            for (chunkNum = beginChunkNum; chunkNum < endChunkNum + 1; chunkNum += 1) {
                const bufferBegin = (chunkNum % CHUNKS_PER_ACK) * CHUNK_MTU;
                const bufferEnd = Math.min((bufferBegin + CHUNK_MTU), blockBuffer.byteLength);
                const chunkBuffer = blockBuffer.slice(bufferBegin, bufferEnd);
                if (this._isCancel) {
                    this._confirmCancelRequest();
                    reader.abort();
                    break;
                } else {
                    await this._conn.send(chunkBuffer, e => {
                        if (e.next) {
                            this._sendBlock(e.next);
                            return;
                        }
                        if (e.done) {
                            this._statusChanged(PeerStatus.idle);
                            this._emitMessage('发送完成');
                            this._conn.close();
                        }
                    });
                    const progress = (chunkNum + 1) / chunksTotal;
                    this.emit('sending-progress', progress);
                    this._emitMessage(`正在发送 ${(progress * 100).toFixed(0)}%`);
                }
            }
        };
        reader.onerror = () => {
            this._emitError('文件读取失败');
            this._statusChanged(PeerStatus.idle);
            this._conn.close();
        };
        reader.readAsArrayBuffer(blockBlob);
    }

    _createConnection(id) {
        return new Promise((resolve) => {
            this._conn = new LocalConnection(this._config);
            this._conn.on('connection', () => resolve());
            this._conn.on('disconnected', () => this.emit('disconnected'));
            this._conn.on('error', err => this._emitError(err));
            this._conn.on('message', (data, fn) => this._process(data, fn));
            this._conn.connect(id);
        });
    }

    _process(e, fn) {
        switch (e.type) {
            case PacketType.cancel_receive: {
                this._isCancel = true;
                if (fn) fn();
                break;
            }
        }
    }

    _statusChanged(status) {
        if (this._status === status) return;
        this._status = status;
        this.emit('status-changed', status);
    }

    _emitMessage(message) {
        message = message || '';
        this.emit('message', message);
    }

    _emitError(error) {
        this.emit('error', error);
    }

    _getSingleFile(item) {
        return new Promise((resolve) => {
            if (item instanceof DataTransferItem) {
                const entry = item.webkitGetAsEntry();
                entry.file(e => resolve(e));
            } else {
                resolve(item);
            }
        });
    }
}