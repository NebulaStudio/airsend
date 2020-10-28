<template>
  <div class="your-widget">
    <popper placement="top" ref="popper" v-model="showDialog">
      <copy-link-message @close="showDialog = false"></copy-link-message>
      <div
        slot="reference"
        class="avatar"
        @click="avatarClick"
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
        <file-field ref="fileField" @change="changeFile"></file-field>
        <paster @changed="onPaste"></paster>
      </div>
    </popper>
    <div class="user-info">
      <div class="user-label">你</div>
      <div class="user-message">
        <span v-if="label">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Popper from './Popper';
import Paster from './Paster';
import FileField from './FileField';
import CopyLinkMessage from './CopyLinkMessage';
export default {
  props: {
    label: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
  components: {
    Popper,
    Paster,
    FileField,
    CopyLinkMessage,
  },
  data() {
    return {
      showDialog: false,
    };
  },
  methods: {
    onPaste(e) {},
    changeFile(e) {},
    avatarClick() {
      this.$refs.fileField.selectFile();
    },
    drop(e) {
      e.preventDefault();
    },
    dragover(e) {
      e.preventDefault();
    },
    dragleave(e) {
      e.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
$user-size: 76px;
$user-label: #333;
$user-message: #999;
.your-widget {
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
      width: $user-size - 10;
      height: $user-size - 10;
      border-radius: 50%;
      box-sizing: border-box;
      border: 1px solid #c0c0c0;
      animation: shadow 0.8s ease-in;
      transition: all 0.2s ease-in-out;
      box-shadow: rgba(black, 0.2) 0 0 3px;
    }
  }
  .user-info {
    left: 50%;
    width: 140px;
    top: $user-size;
    margin-left: -70px;
    position: absolute;
    user-select: none;
    .user-label {
      font-size: 1.4rem;
      font-weight: bold;
      color: $user-label;
      padding-bottom: 0.4rem;
    }
    .user-message {
      font-size: 1rem;
      line-height: 1.2em;
      position: relative;
      display: inline-block;
      color: $user-message;
      > strong {
        display: block;
      }
    }
  }
}
</style>
