import './icons';
import Vue from 'vue';
import 'webrtc-adapter';
import App from './App.vue';
import VueModal from 'vue-js-modal';
import VueCookies from 'vue-cookies';
import Clipboard from 'vue-clipboard2';
import SvgIcon from './components/SvgIcon';

Vue.config.productionTip = false;

Vue.use(SvgIcon);
Vue.use(VueModal);
Vue.use(Clipboard);
Vue.use(VueCookies);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
