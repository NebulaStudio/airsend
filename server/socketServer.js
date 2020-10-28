const events = require('events');
const crypto = require('crypto');
const config = require('./config');
const SocketIO = require('socket.io');
const userService = require('./services/user');

class SocketServer extends events.EventEmitter {
  constructor(server) {
    super();
    this.io = null;
    this.server = server;
  }

  serve() {
    userService.clean().then(() => {
      this.io = SocketIO(this.server, {
        transports: ['websocket'],
        pingInterval: 5000,
      });
      this.io.on('connection', async (client) => {
        client.rid = this.getRoomID(client);
        const address =
          client.handshake.headers['x-forwarded-for'] ||
          client.handshake.address;
        const peer = await this.join(client.id, client.rid, address);
        if (peer == null) return;
        client.join(client.rid);
        await this.broadcast(client);
        client.on('disconnect', async () => {
          await this.leave(client.id, client.rid);
          client.leave(client.rid);
        });
        client.on('offer', (cid, offer, fn) => {
          const isSent = this.offer(cid, client.id, offer, fn);
          if (!isSent) {
            const err = new Error('对方已断开了连接。');
            client.emit('peer-error', client.id, err);
          }
        });
        client.on('ice', (cid, candidate) => {
          const isSent = this.ice(cid, client.id, candidate);
          if (!isSent) {
            const err = new Error('对方已断开了连接。');
            client.emit('peer-error', cid, err);
          }
        });
      });
    });
  }

  getRoomID(socket) {
    const address =
      socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    const id = socket.handshake.query.rid;
    const hex = crypto
      .createHmac('md5', config.secret)
      .update(address)
      .digest('hex');
    const rid = id || hex;
    return rid;
  }

  async join(id, rid, address) {
    const peer = await userService.join(id, rid, address);
    if (peer) this.io.to(peer.rid).emit('join', peer);
    return peer;
  }

  async leave(id, rid) {
    await userService.leave(id, rid);
    this.io.to(rid).emit('leave', id);
  }

  async broadcast(socket) {
    const peers = await userService.getPeers(socket.id, socket.rid);
    socket.emit('peers', peers);
  }

  offer(id, from, offer, fn) {
    const socket = this.io.sockets.connected[id];
    if (socket == null) return false;
    socket.emit('offer', from, offer, fn);
    return true;
  }

  ice(id, from, candidate) {
    const socket = this.io.sockets.connected[id];
    if (socket == null) return false;
    socket.emit('ice', from, candidate);
    return true;
  }
}

module.exports = SocketServer;
