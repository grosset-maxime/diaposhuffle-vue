import Vue from 'vue';
import Vuetify, {
  VApp,
  VBtn,
  VAlert,
} from 'vuetify/lib';

Vue.use(Vuetify, {
  components: {
    VApp,
    VBtn,
    VAlert,
  },
});

const opts = {
  theme: {
    dark: true,
  },
};

export default new Vuetify(opts);
