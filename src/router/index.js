import Vue from 'vue';
import VueRouter from 'vue-router';

import pages from './pages';

const DiapoShuffle = () => import('../pages/DiapoShuffle.vue');
const Export = () => import('../pages/Export.vue');
const Settings = () => import('../pages/Settings.vue');

Vue.use(VueRouter);

const routes = [{
  path: pages.diapoShuffle.path,
  name: pages.diapoShuffle.name,
  component: DiapoShuffle,
}, {
  path: pages.export.path,
  name: pages.export.name,
  component: Export,
}, {
  path: pages.settings.path,
  name: pages.settings.name,
  component: Settings,
}];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
