<template>
  <div>
    <link-panel
      :value="value"
      @copy="action('copy')"
      @open="action('open')"
      @cancel="$emit('cancel')"
      v-if="value.type === 'link'"
    ></link-panel>
    <text-panel
      :value="value"
      @copy="action('copy')"
      @cancel="$emit('cancel')"
      v-if="value.type === 'text'"
    ></text-panel>
    <file-panel
      :value="value"
      @accept="action('none')"
      @cancel="$emit('cancel')"
      v-if="value.type === 'file' || value.type === 'blob'"
    ></file-panel>
  </div>
</template>

<script>
import FilePanel from './components/FilePanel';
import LinkPanel from './components/LinkPanel';
import TextPanel from './components/TextPanel';
export default {
  components: {
    FilePanel,
    LinkPanel,
    TextPanel,
  },
  props: {
    value: {
      type: Object,
      default: null,
    },
  },
  methods: {
    action(action) {
      this.$emit('accept', action, this.value);
    },
  },
};
</script>
