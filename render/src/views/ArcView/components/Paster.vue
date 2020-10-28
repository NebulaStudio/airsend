<template>
  <input class="paste-widget" @paste="onPaste" v-model="message" />
</template>

<script>
export default {
  data() {
    return {
      message: null,
    };
  },
  watch: {
    message() {
      this.message = null;
    },
  },
  methods: {
    onPaste(e) {
      const data = e.clipboardData.getData('text');
      this.$emit('changed', data);
    },
  },
};
</script>

<style lang="scss" scoped>
.paste-widget {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 2;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  background: transparent;
  border: 0px;
  outline: none;
  cursor: default;
  color: transparent;
}
</style>
