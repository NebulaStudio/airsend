<template>
  <div id="app" class="app">
    <div class="logo">
      <img src="@/assets/logo.png" />
    </div>
    <arc-view
      :your="your"
      :peers="peers"
      class="arc-view"
      @selected="selected"
      @clean-error="cleanError"
      @accept-request="acceptRequest"
      @abort-request="abortRequest"
      @packing="packing"
      @pack-error="packError"
      @cancel="cancel"
    ></arc-view>
    <div class="toolkit">
      <join :url="joinURL"></join>
      <appearance @mode-changed="modeChanged"></appearance>
    </div>
    <div class="description" v-if="your && your.label">
      一个基于 P2P 的文件分享服务。别人会把你看成 <b>{{ your.label }}</b
      >。
    </div>
    <div class="friendship">
      <a href="https://github.com/NebulaStudio/airsend/" target="_blank">
        <svg-icon 
          className="github"
          iconClass="github"
        ></svg-icon>
      </a>
      <img src="@/assets/webrtc.png" />
    </div>
  </div>
</template>

<script>
import Join from './views/Toolkit/Join';
import Receiver from './services/receiver';
import PeerStatus from './utils/peerStatus';
import ArcView from './views/ArcView/Index';
import Dispatcher from './services/dispatcher';
import MessageBox from './services/messageBox';
import SocketClient from './services/socketClient';
import Appearance from './views/Toolkit/Appearance';

const empty = '';

export default {
  components: {
    Join,
    ArcView,
    Appearance,
  },
  data() {
    return {
      your: null,
      peers: [],
      config: null,
      inquires: new Map(),
      receivers: new Map(),
      dispatchers: new Map(),
    };
  },
  methods: {
    selected(e) {
      const peer = this.peers.find((t) => t.id === e.id);
      if (peer == null) return;
      const dispatcher = this.getDispatcher(peer);
      dispatcher.request(e).catch((err) => (peer.error = err.message));
    },
    cancel(id) {
      if (this.dispatchers.has(id)) {
        const dispatcher = this.dispatchers.get(id);
        return dispatcher.cancelRequest();
      }
      if (this.receivers.has(id)) {
        const receiver = this.receivers.get(id);
        return receiver.cancelReceive();
      }
    },
    getDispatcher(peer) {
      let item = this.dispatchers.get(peer.id);
      if (item == null) {
        item = new Dispatcher(peer.id, peer.name, this.config);
        item.on('sending-progress', (value) => {
          const peer = this.peers.find((t) => t.id === item.id);
          if (peer == null) return;
          peer.percentage = value;
        });
        item.on('status-changed', (status) => {
          const peer = this.peers.find((t) => t.id === item.id);
          if (peer == null) return;
          peer.status = status;
        });
        item.on('message', (msg) => {
          const peer = this.peers.find((t) => t.id === item.id);
          if (peer == null) return;
          peer.message = msg;
        });
        item.on('error', (err) => {
          const peer = this.peers.find((t) => t.id === item.id);
          if (peer == null) return;
          peer.error = err.message;
        });
        item.on('disconnected', () => {
          if (this.inquires.has(item.id)) this.inquires.delete(item.id);
          if (this.dispatchers.has(item.id)) this.dispatchers.delete(item.id);
        });
        this.dispatchers.set(peer.id, item);
      }
      return item;
    },
    cleanError(id) {
      const peer = this.peers.find((t) => t.id === id);
      if (peer) {
        peer.error = empty;
        peer.message = empty;
      }
    },
    acceptRequest(id, action, request) {
      const peer = this.peers.find((t) => t.id === id);
      if (peer === null) return;
      switch (action) {
        case 'open': {
          const link = document.createElement('a');
          link.href = request.data;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => document.body.removeChild(link), 100);
          break;
        }
        case 'copy':
          this.$copyText(request.data);
          peer.message = '已复制';
          break;
      }
      const callback = this.inquires.get(id);
      if (callback == null) return;
      callback(true);
      this.inquires.delete(id);
      if (request.type === 'file') {
        peer.status = PeerStatus.receiving;
      } else {
        peer.status = PeerStatus.idle;
      }
    },
    abortRequest(id) {
      const callback = this.inquires.get(id);
      if (callback == null) return;
      const peer = this.peers.find((t) => t.id === id);
      if (peer === null) return;
      callback(false);
      peer.status = PeerStatus.idle;
      peer.message = '已拒绝';
      this.inquires.delete(id);
    },
    connect() {
      SocketClient.connect();
      SocketClient.on('join', (e) => this.peers.push(e));
      SocketClient.on('leave', (id) => {
        const index = this.peers.findIndex((t) => t.id === id);
        if (index === -1) return;
        this.peers.splice(index, 1);
      });
      SocketClient.on('peers', (peers) => {
        const index = peers.findIndex((t) => t.yourself);
        if (index === -1) return;
        this.your = peers.splice(index, 1)[0];
        this.config = this.your.iceServer;
        this.peers = peers;
      });
      SocketClient.on('ice', (id, candidate) => {
        if (this.dispatchers.has(id)) {
          const dispatcher = this.dispatchers.get(id);
          dispatcher.addIceCandidate(candidate);
          return;
        }
        if (this.receivers.has(id)) {
          const receiver = this.receivers.get(id);
          receiver.addIceCandidate(candidate);
          return;
        }
      });
      SocketClient.on('offer', (id, offer, fn) => {
        const receiver = new Receiver(this.config);
        receiver.on('receiving-progress', (value) => {
          const peer = this.peers.find((t) => t.id == receiver.id);
          if (peer == null) return;
          peer.percentage = value;
        });
        receiver.on('status-changed', (status) => {
          const peer = this.peers.find((t) => t.id == receiver.id);
          if (peer == null) return;
          peer.status = status;
        });
        receiver.on('message', (msg) => {
          const peer = this.peers.find((t) => t.id == receiver.id);
          if (peer == null) return;
          peer.message = msg;
        });
        receiver.on('inquire', (data, fn) => {
          const peer = this.peers.find((t) => t.id == receiver.id);
          if (peer == null) return;
          data.from = peer.label;
          peer.request = data;
          this.inquires.set(receiver.id, fn);
          const messageBox = new MessageBox();
          let icon = `/avatar/${peer.icon}`;
          let body = empty;
          switch (data.type) {
            case 'link':
              body = `${data.from} 给你发送了一条链接。`;
              break;
            case 'text':
              body = `${data.from} 给你发送了一段文本。`;
              break;
            default:
              body = `${data.from} 给你发送 ${data.count} 个文件。`;
              break;
          }
          messageBox.show(body, icon);
        });
        receiver.on('cancel-inquire', () => {
          if (this.inquires.has(receiver.id)) this.inquires.delete(receiver.id);
        });
        receiver.on('disconnected', () => {
          if (this.receivers.has(receiver.id))
            this.receivers.delete(receiver.id);
        });
        this.receivers.set(id, receiver);
        receiver.accept(id, offer, fn).then();
      });
      SocketClient.on('error', (cid, err) => {
        const peer = this.peers.find((t) => t.id === cid);
        if (peer == null) return;
        peer.error = err.message;
        peer.status = PeerStatus.idle;
      });
    },
    packing(id, text) {
      const peer = this.peers.find((t) => t.id === id);
      if (peer == null) return;
      if (peer.status !== PeerStatus.packing) {
        peer.status = PeerStatus.packing;
      }
      peer.message = text;
    },
    packError(id, err) {
      const peer = this.peers.find((t) => t.id === id);
      if (peer == null) return;
      peer.status = PeerStatus.idle;
      peer.message = err.message;
    },
    modeChanged(e) {
      document.body.className = e;
    },
  },
  computed: {
    joinURL() {
      if (this.your) {
        const local = window.location;
        return `${local.protocol}//${local.host}?rid=${this.your.rid}`;
      }
      return empty;
    },
  },
  created() {
    this.connect();
  },
};
</script>

<style lang="scss">
html {
  line-height: 1;
  height: 100%;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 10px;
  body {
    height: 100%;
    #app {
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      font-family: Avenir, Helvetica, Arial, sans-serif;
    }
    .app {
      .logo {
        position: absolute;
        top: 10px;
        left: 15px;
        width: 162px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .arc-view {
        display: block;
      }
      .toolkit {
        position: absolute;
        top: 20px;
        right: 25px;
        width: 60px;
        height: 18px;
        display: flex;
        justify-content: space-between;
      }
      .description {
        position: absolute;
        bottom: 20px;
        left: 0;
        right: 0;
        height: 28px;
        text-align: center;
        color: #666;
      }
      .friendship {
        position: absolute;
        bottom: 0;
        right: 0;
        .github {
          font-size: 22px;
          margin-right: 10px;
          margin-bottom: 6px;
        }
        img {
          width: 80px;
          margin-left: 6px;
          margin-right: 10px;
          margin-bottom: 6px;
        }
      }
    }
  }
  .dark {
    background: rgba(0, 0, 0, 0.9);
  }
}
</style>
