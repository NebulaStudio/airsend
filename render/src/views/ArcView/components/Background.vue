<template>
  <svg class="circles" viewBox="-0.5 -0.5 1140 700">
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="30"
      stroke="rgba(160,160,160, 1)"
    />
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="100"
      stroke="rgba(160,160,160,.9)"
    />
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="200"
      stroke="rgba(160,160,160,.8)"
    />
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="300"
      stroke="rgba(160,160,160,.7)"
    />
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="400"
      stroke="rgba(160,160,160,.6)"
    />
    <circle
      class="circle"
      cx="570"
      cy="570"
      r="500"
      stroke="rgba(160,160,160,.5)"
    />
  </svg>
</template>

<style lang="scss" scoped>
.circles {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 1140px;
  margin-left: -570px;
  height: 700px;
  z-index: -1;
  transform-origin: 570px 570px;
  animation: grow 1.5s ease-out;
  .circle {
    stroke-width: 0.4;
    fill: rgba(0, 0, 0, 0);
  }
}
@keyframes grow {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0.2;
  }
  51% {
    transform: scale(0.5, 0.5);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .circles {
    display: none;
  }
}
</style>
