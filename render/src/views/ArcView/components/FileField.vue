<template>
  <form ref="form">
    <input ref="fileInput" type="file" multiple @change="change" />
  </form>
</template>

<script>
export default {
  methods: {
    change(e) {
      this.$emit('change', e.target.files);
    },
    selectFile() {
      this.$refs.form.reset();
      this.$refs.fileInput.click();
    },
  },
};
</script>

<style lang="scss" scoped>
form {
  input {
    visibility: hidden;
  }
}
</style>
