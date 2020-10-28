<template>
  <div id="join" @click="join">
    <svg-icon className="svg" iconClass="join"></svg-icon>
    <modal name="join">
      <div class="title">
        <img src="@/assets/logo.png" />
      </div>
      <div class="slogan">
        允许你在不同网络中的设备之间共享文件
      </div>
      <div class="copy-title">
        复制提供的地址并发送给其他人：
      </div>
      <div class="copy">
        <input :value="url" />
      </div>
      <div class="close">
        <a href="javascript:void(0);" @click="close" class="btn">我知道了</a>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: '',
    },
  },
  methods: {
    join() {
      this.$modal.show('join');
    },
    close() {
      this.$modal.hide('join');
      return false;
    },
  },
};
</script>

<style lang="scss">
#join {
  .svg {
    font-size: 18px;
    cursor: pointer;
  }
  .vm--container {
    .vm--modal {
      .title {
        margin-top: 15px;
        margin-left: 20px;
        height: 35px;
        display: flex;
        align-items: center;
        img {
          height: 30px;
          margin-right: 10px;
        }
        span {
          font-size: 18px;
          color: #333;
        }
      }
      .slogan {
        margin-top: 15px;
        margin-left: 20px;
        color: #000;
        font-size: 16px;
        font-weight: bold;
      }
      .copy-title {
        margin-top: 25px;
        margin-left: 20px;
        color: #666;
        font-size: 14px;
      }
      .copy {
        margin-top: 15px;
        margin-left: 20px;
        margin-right: 20px;
        input {
          display: block;
          width: 90%;
          height: 26px;
          padding: 6px 12px;
          font-size: 14px;
          color: #666;
          background-color: #fff;
          background-image: none;
          border: 1px solid #ccc;
          border-radius: 4px;
          -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
          -webkit-transition: border-color ease-in-out 0.15s,
            -webkit-box-shadow ease-in-out 0.15s;
          -o-transition: border-color ease-in-out 0.15s,
            box-shadow ease-in-out 0.15s;
          transition: border-color ease-in-out 0.15s,
            box-shadow ease-in-out 0.15s;
        }
      }
      .close {
        margin-top: 90px;
        text-align: center;
        .btn {
          font-size: 14px;
          text-decoration: none;
          color: #3280fc;
        }
      }
    }
  }
}
</style>
