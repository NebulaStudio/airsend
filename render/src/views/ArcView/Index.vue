<template>
  <div>
    <background />
    <dashboard :your="your" :peers="peers" @selected="selected" @accept-request="acceptRequest" @abort-request="abortRequest" @avatar-click="avatarClick" @clean-error="cleanError" @packing="packing" @pack-error="packError" @cancel="cancel"></dashboard>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard';
import Background from './components/Background';
export default {
  components: {
    Dashboard,
    Background,
  },
  props: {
    your: {
      type: Object,
      default: null,
    },
    peers: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    cancel(id) {
      this.$emit('cancel', id);
    },
    cleanError(id) {
      this.$emit('clean-error', id);
    },
    acceptRequest(id, action, request) {
      this.$emit('accept-request', id, action, request);
    },
    abortRequest(id) {
      this.$emit('abort-request', id);
    },
    avatarClick(id) {
      this.$emit('avatar-click', id);
    },
    selected(e) {
      this.$emit('selected', e);
    },
    packing(id, text) {
      this.$emit('packing', id, text);
    },
    packError(id, err) {
      this.$emit('pack-error', id, err);
    }
  },
};
</script>
