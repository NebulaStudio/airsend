<template>
  <div class="error-message">
    <div class="message">
      <div class="icon">
        <svg-icon className="error" iconClass="error"></svg-icon>
      </div>
      <div>
        <div class="title">传输错误</div>
        <div class="content">
          {{ message }}
        </div>
      </div>
    </div>
    <div class="footer">
      <a @click="$emit('clean-error')">确定</a>
    </div>
  </div>
</template>

<script>
const empty = '';

export default {
  props: {
    message: {
      type: String,
      default: empty,
    },
  },
};
</script>

<style lang="scss" scoped>
.error-message {
  width: 325px;
  min-height: 40px;
  .message {
    display: flex;
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 36px;
      .error {
        font-size: 30px;
      }
    }
    .title {
      padding: 0 6px;
      font-size: 1.2rem;
      color: #333;
      font-weight: bold;
    }
    .content {
      padding: 6px;
      color: #666;
    }
  }
  .footer {
    display: flex;
    padding-right: 6px;
    justify-content: flex-end;
    a {
      color: #0088cc;
      font-size: 1.2rem;
    }
  }
}
</style>
