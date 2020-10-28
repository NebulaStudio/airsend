<template>
  <svg class="waiting" viewBox="0 0 76 76">
    <circle class="loading" cx="38" cy="38" r="36" fill="none" />
  </svg>
</template>
<style lang="scss" scoped>
.waiting {
  width: 76px;
  height: 76px;
  animation: rotate 2s linear infinite;
  .loading {
    stroke: #ddd;
    stroke-width: 2px;
    animation: dash 1.5s linear infinite;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 130, 200;
    stroke-dashoffset: -50;
  }
  100% {
    stroke-dasharray: 130, 200;
    stroke-dashoffset: -188;
  }
}
</style>