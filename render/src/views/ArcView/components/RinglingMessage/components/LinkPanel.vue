<template>
  <div class="link-panel">
    <div class="body">
      <div class="icon">
        <img class="img" src="/icons/link/" />
      </div>
      <div class="message">
        <p>
          <b>{{ value.from }}</b> 给你发送了一条链接：
        </p>
        <p>
          <a @click="$emit('open')">{{ message }}</a>
        </p>
      </div>
    </div>
    <div class="footer">
      <div class="actions">
        <a @click="$emit('open')">打开链接</a>
        <a @click="$emit('copy')">复制链接</a>
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
      let message = this.value.data;
      if (message > 50) {
        message = message.substr(0, 47) + "...";
      }
      return message;
    }
  }
}
</script>

<style lang="scss" scoped>
$blue: #0088cc;
.link-panel {
  width: 325px;
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
      p {
        a {
          color: $blue;
          cursor: pointer;
        }
      }
    }
  }
  .footer {
    display: flex;
    padding-top: 6px;
    justify-content: flex-end;
    .actions {
      width: 140px;
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