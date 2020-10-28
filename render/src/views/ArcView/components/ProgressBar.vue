<template>
  <svg width="72px" height="72px" viewBox="0 0 72 72">
    <path class="break" :d="process" transform="translate(36, 36)" />
  </svg>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  computed: {
    process() {
      const π = Math.PI
      const α = this.value * 360
      const r = (α * π) / 180
      const mid = α > 180 ? 1 : 0
      const x = Math.sin(r) * 36
      const y = Math.cos(r) * -36
      return `M 0 0 v -36 A 36 36 1 ${mid} 1 ${x} ${y} z` //anim 
    }
  }
}
</script>

<style lang="scss" scoped>
$blue: #0088cc;
svg {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  z-index: -1;
  fill: rgba($blue, 0.5);
}
</style>