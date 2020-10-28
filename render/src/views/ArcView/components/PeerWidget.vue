<template>
  <div class="peer-widget">
    <div class="avatar">
      <progress-bar v-if="showProgress" :value="percentage"></progress-bar>
      <waiting-bar v-if="showWaiting"></waiting-bar>
      <file-field ref="fileField" @change="changeFile"></file-field>
      <popper placement="top" :value="showDialog" ref="popper">
        <error-message
          v-if="error.length > 0"
          :message="error"
          @clean-error="cleanError"
        ></error-message>
        <ringling-message
          :value="request"
          @accept="accept"
          @cancel="abort"
        ></ringling-message>
        <div
          slot="reference"
          class="avatar"
          @click.exact.stop="avatarClick"
          @drop.exact="drop"
          @dragover.exact="dragover"
          @dragleave.exact="dragleave"
        >
          <img
            v-if="label"
            class="gravatar"
            :alt="label"
            :src="'/avatar/' + icon"
          />
          <paster v-if="showPaster" @changed="onPaste"></paster>
        </div>
      </popper>
    </div>
    <div class="user-info">
      <div v-if="label" class="user-label">
        {{ label }}
      </div>
      <div class="user-message">
        <span>
          {{ message }}
          <svg-icon
            v-if="showCancel"
            @click="cancel"
            className="cancel"
            iconClass="cancel"
          ></svg-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Paster from './Paster';
import Popper from './Popper';
import FileField from './FileField';
import WaitingBar from './WaitingBar';
import ProgressBar from './ProgressBar';
import ErrorMessage from './ErrorMessage';
import Packer from '../../../services/packer';
import PeerStatus from '../../../utils/peerStatus';
import RinglingMessage from './RinglingMessage/Index';

const empty = '';

export default {
  props: {
    id: {
      type: String,
      default: empty,
    },
    status: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: empty,
    },
    icon: {
      type: String,
      default: empty,
    },
    message: {
      type: String,
      default: empty,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: empty,
    },
    request: {
      type: Object,
      default: null,
    },
  },
  components: {
    Paster,
    Popper,
    FileField,
    WaitingBar,
    ProgressBar,
    ErrorMessage,
    RinglingMessage,
  },
  methods: {
    cleanError() {
      this.$emit('clean-error', this.id);
    },
    accept(action, request) {
      this.$emit('accept-request', this.id, action, request);
    },
    abort() {
      this.$emit('abort-request', this.id);
    },
    cancel() {
      this.$emit('cancel', this.id);
    },
    avatarClick() {
      if (this.status === PeerStatus.idle) {
        this.$refs.fileField.selectFile();
      }
    },
    changeFile(files) {
      const file = files[0];
      const packet = {
        id: this.id,
        isDir: false,
        name: file.name,
        count: files.length,
      };
      const packer = new Packer();
      packer.canPack(files).then((np) => {
        if (np) {
          let currentText;
          packer
            .pack(files, (text) => {
              if (currentText == text) return;
              this.$emit('packing', this.id, text);
            })
            .then((entity) => {
              const index = packet.name.lastIndexOf('.');
              if (index === -1) {
                packet.name = `${packet.name}.zip`;
              } else {
                packet.name = `${packet.name.substr(0, index)}.zip`;
              }
              packet.type = 'file';
              packet.data = entity.stream;
              packet.size = entity.stream.size;
              this.$emit('selected', packet);
            })
            .catch((err) => {
              this.$emit('pack-error', this.id, err);
            });
        } else {
          packet.type = 'file';
          packet.data = file;
          packet.size = file.size;
          this.$emit('selected', packet);
        }
      });
    },
    onPaste(text) {
      const packet = {
        id: this.id,
        type: 'text',
        data: text,
        size: text.length,
      };
      this.$emit('selected', packet);
    },
    drop(e) {
      e.preventDefault();
      const items = e.dataTransfer.items;
      const files = e.dataTransfer.files;
      const file = files[0];
      const packet = {
        id: this.id,
        isDir: false,
        name: file.name,
      };
      const packer = new Packer();
      packer.canPack(items).then((np) => {
        if (np) {
          packer
            .pack(items, (text) => this.$emit('packing', this.id, text))
            .then((entity) => {
              const index = packet.name.lastIndexOf('.');
              if (index === -1) {
                packet.name = `${packet.name}.zip`;
              } else {
                packet.name = `${packet.name.substr(0, index)}.zip`;
              }
              packet.type = 'file';
              packet.data = entity.stream;
              packet.size = entity.stream.size;
              packet.isDir = entity.isDir;
              this.$emit('selected', packet);
            })
            .catch((err) => this.$emit('pack-error', this.id, err));
        } else {
          packet.type = 'file';
          packet.data = file;
          packet.size = file.size;
          this.$emit('selected', packet);
        }
      });
    },
    dragover(e) {
      e.preventDefault();
    },
    dragleave(e) {
      e.preventDefault();
    },
  },
  computed: {
    showProgress() {
      return (
        this.status === PeerStatus.receiving ||
        this.status === PeerStatus.sending
      );
    },
    showWaiting() {
      return this.status === PeerStatus.dialing;
    },
    showDialog() {
      if (this.error.length > 0) return true;
      if (this.status === PeerStatus.ringing) {
        return true;
      }
      return false;
    },
    showPaster() {
      if (this.status === PeerStatus.idle) return true;
      if (this.status === PeerStatus.declined) return true;
      return false;
    },
    showCancel() {
      switch (this.status) {
        case PeerStatus.dialing:
        case PeerStatus.receiving:
        case PeerStatus.sending:
          return true;
        default:
          return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$user-size: 76px;
.peer-widget {
  user-select: none;
  .avatar {
    position: relative;
    width: $user-size;
    height: $user-size;
    transition: all 0.2s ease-in-out;
    .gravatar {
      position: absolute;
      top: 5px;
      left: 5px;
      z-index: 1;
      box-sizing: border-box;
      border: 1px solid #c0c0c0;
      box-shadow: rgba(black, 0.2) 0 0 3px;
      width: $user-size - 10;
      height: $user-size - 10;
      border-radius: 50%;
      animation: shadow 0.8s ease-in;
      transition: all 0.2s ease-in-out;
    }
  }
  .user-info {
    position: absolute;
    top: $user-size;
    left: 50%;
    width: 140px;
    margin-left: -70px;
    .user-label {
      color: #333;
      padding-bottom: 0.4rem;
      font-size: 1.2rem;
    }
    .user-message {
      position: relative;
      display: inline-block;
      font-size: 1rem;
      line-height: 1.2em;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #999;
      > strong {
        display: block;
      }
      span {
        .cancel {
          font-size: 12px;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
