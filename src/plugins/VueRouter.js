import Vue from 'vue';
import VueRouter from 'vue-router';

import pages from '../pages';

import DiapoShuffle from '../pages/DiapoShuffle.vue';
import Export from '../pages/Export.vue';
import Settings from '../pages/Settings.vue';

Vue.use(VueRouter);

const routes = [
  { path: pages.diapoShuffle.path, component: DiapoShuffle },
  { path: pages.export.path, component: Export },
  { path: pages.settings.path, component: Settings },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
