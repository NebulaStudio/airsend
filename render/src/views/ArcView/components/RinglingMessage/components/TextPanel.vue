<template>
  <div class="text-panel">
    <div class="body">
      <div class="icon">
        <img class="img" src="/icons/text/" />
      </div>
      <div class="message">
        <p>
          <b>{{ value.from }}</b> 给你发送了一段文本：
        </p>
        <p>{{ message }}</p>
      </div>
    </div>
    <div class="footer">
      <div class="actions">
        <a @click="$emit('copy')">复制</a>
        <a class="cancel" @click="$emit('cancel')">取消</a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  computed: {
    message() {
      let text = this.value.data;
      if (text.length > 50) {
        text = `${text.substr(0, 47)} ...(后面还有 ${text.length - 47} 个字符)`;
      }
      return text;
    },
  },
};
</script>

<style lang="scss" scoped>
$blue: #0088cc;
.text-panel {
  min-width: 325px;
  min-height: 40px;
  .body {
    display: flex;
    .icon {
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      .img {
        width: 40px;
        height: auto;
        border: 0;
      }
    }
    .message {
      padding: 6px;
    }
  }
  .footer {
    display: flex;
    padding-top: 6px;
    justify-content: flex-end;
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
      .cancel {
        color: #999;
      }
    }
  }
}
</style>
