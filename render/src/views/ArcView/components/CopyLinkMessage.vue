<template>
  <div class="copy-link">
    <div>
      <p>连接已经生成，发给朋友吧</p>
      <p>文件接收连接：http://linlizhongxin.com/123456767</p>
    </div>
    <div>
      <a @click="$emit('close')">关闭</a>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.copy-link {
  width: 400px;
}
</style>