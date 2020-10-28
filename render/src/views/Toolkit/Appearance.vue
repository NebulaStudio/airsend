<template>
  <div id="appearance" @click="set">
    <svg-icon className="mode" :iconClass="mode"></svg-icon>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mode: 'light',
    };
  },
  methods: {
    get() {
      const mode = this.$cookies.get('mode');
      this.mode = mode || this.mode;
      this.$emit('mode-changed', this.mode);
    },
    set() {
      if (this.mode === 'light') {
        this.mode = 'dark';
      } else {
        this.mode = 'light';
      }
      this.$cookies.set('mode', this.mode, '30d');
      this.$emit('mode-changed', this.mode);
    },
  },
  created() {
    this.get();
  },
};
</script>

<style lang="scss" scoped>
#appearance {
  .mode {
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
