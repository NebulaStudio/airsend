<template>
  <div id="dashboard">
    <your-widget
      class="peer"
      v-if="your && your.label"
      :label="your.label"
      :icon="your.icon"
    ></your-widget>
    <peer-widget
      class="peer"
      v-for="(peer, index) of peers"
      :key="index"
      :id="peer.id"
      :label="peer.label"
      :icon="peer.icon"
      :status="peer.status"
      :percentage="peer.percentage"
      :error="peer.error"
      :request="peer.request"
      :message="peer.message"
      @selected="selected"
      @clean-error="cleanError"
      @accept-request="acceptRequest"
      @abort-request="abortRequest"
      @avatar-click="avatarClick"
      @packing="packing"
      @pack-error="packError"
      @cancel="cancel"
    ></peer-widget>
  </div>
</template>

<script>
import PeerWidget from './PeerWidget';
import YourWidget from './YourWidget';
export default {
  components: {
    YourWidget,
    PeerWidget,
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
    selected(e) {
      this.$emit('selected', e);
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
    packing(id, text) {
      this.$emit('packing', id, text);
    },
    packError(id, err) {
      this.$emit('pack-error', id, err);
    },
  },
};
</script>

<style lang="scss" scoped>
$user-size: 76px;
#dashboard {
  .peer {
    position: absolute;
    left: 50%;
    bottom: 91px;
    width: $user-size;
    height: $user-size;
    margin-left: -$user-size / 2;
    text-align: center;
    &:nth-of-type(2) {
      margin-left: -186px;
      bottom: 225px;
    }
    &:nth-of-type(3) {
      margin-left: 120px;
      bottom: 225px;
    }
    &:nth-of-type(4) {
      margin-left: -186px;
      bottom: 365px;
    }
    &:nth-of-type(5) {
      margin-left: 120px;
      bottom: 365px;
    }
    &:nth-of-type(6) {
      margin-left: -326px;
      bottom: 180px;
    }
    &:nth-of-type(7) {
      margin-left: 260px;
      bottom: 180px;
    }
    &:nth-of-type(8) {
      margin-left: -366px;
      bottom: 320px;
    }
    &:nth-of-type(9) {
      margin-left: 300px;
      bottom: 320px;
    }
    &:nth-of-type(10) {
      margin-left: -436px;
      bottom: 90px;
    }
    &:nth-of-type(11) {
      margin-left: 370px;
      bottom: 90px;
    }
    &:nth-of-type(12) {
      bottom: 400px;
    }
    &:nth-of-type(13) {
      margin-left: -236px;
      bottom: 90px;
    }
    &:nth-of-type(14) {
      margin-left: 170px;
      bottom: 90px;
    }
    &:nth-of-type(15) {
      margin-left: -145px;
      bottom: 480px;
    }
    &:nth-of-type(16) {
      margin-left: 90px;
      bottom: 480px;
    }
    &:nth-of-type(17) {
      margin-left: -330px;
      bottom: 500px;
    }
    &:nth-of-type(18) {
      margin-left: 260px;
      bottom: 500px;
    }
    &:nth-of-type(19) {
      margin-left: -38px;
      bottom: 600px;
    }
    &:nth-of-type(20) {
      margin-left: 450px;
      bottom: 220px;
    }
    &:nth-of-type(21) {
      margin-left: -530px;
      bottom: 220px;
    }
  }
}
</style>
