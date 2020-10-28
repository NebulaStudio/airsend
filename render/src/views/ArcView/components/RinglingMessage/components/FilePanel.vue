<template>
  <div class="file-panel">
    <div class="body">
      <div class="icon">
        <img class="img" :src="imgLink" />
        <div class="title">
          {{ value.name }}
        </div>
      </div>
      <div class="message">
        <p>
          <b>{{ value.from }}</b> 想要给你发送
          {{ value.count }} 个文件，是否接收？
        </p>
      </div>
    </div>
    <div class="footer">
      <div class="subtitle">
        {{ subtitle }}
      </div>
      <div class="actions">
        <a @click="$emit('accept')">接收</a>
        <a @click="$emit('cancel')">拒绝</a>
      </div>
    </div>
  </div>
</template>

<script>
const empty = '';
import format from '../../../../../utils/format';
export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  computed: {
    subtitle() {
      if (this.value) {
        const size = this.value.size || 0;
        return format.fileSize(size);
      }
      return empty;
    },
    imgLink() {
      if (this.value) {
        const dir = this.value.isDir ? 1 : 0;
        return `/icons/file/${dir}/${this.value.name}`;
      }
      return empty;
    },
  },
};
</script>

<style lang="scss" scoped>
$blue: #0088cc;
.file-panel {
  width: 325px;
  min-height: 40px;
  .body {
    display: flex;
    .icon {
      width: 66px;
      padding: 6px;
      display: flex;
      align-items: center;
      flex-direction: column;
      .img {
        width: 40px;
        height: auto;
        border: 0;
      }
      .title {
        width: 100%;
        line-height: 18px;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    .message {
      padding: 6px;
    }
  }
  .footer {
    display: flex;
    padding-top: 6px;
    justify-content: space-between;
    .subtitle {
      width: 66px;
      text-align: center;
    }
    .actions {
      width: 60px;
      display: flex;
      padding-right: 6px;
      justify-content: space-between;
      a {
        color: $blue;
        cursor: pointer;
        font-size: 1.2rem;
      }
    }
  }
}
</style>
