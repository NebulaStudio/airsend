<template>
  <div class="popper">
    <div ref="reference" aria-describedby="tooltip">
      <slot name="reference"></slot>
    </div>
    <div class="tooltip" ref="tooltip" role="tooltip">
      <slot></slot>
      <div class="arrow" data-popper-arrow></div>
    </div>
  </div>
</template>

<script>
import { createPopper } from "@popperjs/core";
export default {
  props: {
    placement: {
      type: String,
      default: 'top'
    },
    value: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      instance: null,
    }
  },
  watch: {
    value(e) {
      this.$nextTick(() => {
        if (e) {
          this.show();
          this.$refs.tooltip.setAttribute('data-show', '');
        } else {
          this.close();
          this.$refs.tooltip.removeAttribute('data-show');
        }
      });
    }
  },
  methods: {
    show() {
      const modifiers = [{
        name: 'offset',
        options: {
          offset: [0, 8]
        }
      }];
      const options = {
        modifiers: modifiers,
        placement: this.placement,
      }
      this.instance = createPopper(this.$refs.reference, this.$refs.tooltip, options);
    },
    close() {
      if (this.instance) {
        this.instance.destroy();
        this.instance = null;
      }
    }
  }
}
</script>
 
<style lang="scss">
.popper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .tooltip {
    background: #fff;
    min-width: 150px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    padding: 12px;
    z-index: 999;
    text-align: justify;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    word-break: break-all;
    display: none;
    .arrow {
      position: absolute;
      width: 8px;
      height: 8px;
      z-index: -1;
      &::before {
        position: absolute;
        width: 8px;
        height: 8px;
        z-index: -1;
        content: "";
        transform: rotate(45deg);
        background: #fff;
      }
    }
    &[data-show] {
      display: block;
    }
    &[data-popper-placement^="top"] {
      .arrow {
        bottom: -4px;
        &::before {
          border-right: 1px solid #ebeef5;
          border-bottom: 1px solid #ebeef5;
        }
      }
    }
    &[data-popper-placement^="bottom"] {
      .arrow {
        top: -4px;
        &::before {
          border-top: 1px solid #ebeef5;
          border-left: 1px solid #ebeef5;
        }
      }
    }
    &[data-popper-placement^="left"] {
      .arrow {
        right: -4px;
        &::before {
          border-top: 1px solid #ebeef5;
          border-right: 1px solid #ebeef5;
        }
      }
    }
    &[data-popper-placement^="right"] {
      .arrow {
        left: -4px;
        &::before {
          border-left: 1px solid #ebeef5;
          border-bottom: 1px solid #ebeef5;
        }
      }
    }
  }
}
</style>

