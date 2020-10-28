import events from "events";
import SocketIO from 'socket.io-client';

class SocketClient extends events.EventEmitter {
    constructor() {
        super();
        this._socket = null;
    }
    connect() {
        const options = {
            transports: ['websocket']
        };
        this._socket = SocketIO(window.location.href, options);
        this._socket.on('join', e => this.emit('join', e));
        this._socket.on('peers', e => this.emit("peers", e));
        this._socket.on('leave', e => this.emit('leave', e));
        this._socket.on('offer', (cid, offer, fn) => this.emit('offer', cid, offer, fn));
        this._socket.on('ice', (cid, candidate) => this.emit('ice', cid, candidate));
        this._socket.on('peer-error', (cid, e) => this.emit('error', cid, e));
    }

    sendOffer(id, offer, fn) {
        if (this._socket.connected) {
            this._socket.emit('offer', id, offer, fn);
            return true;
        }
        return false;
    }

    sendIcecandidate(id, candidate) {
        if (this._socket.connected) {
            this._socket.emit('ice', id, candidate);
            return true;
        }
        return false;
    }
}
export default new SocketClient();