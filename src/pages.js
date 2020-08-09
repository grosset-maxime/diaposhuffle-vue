const pages = {
  diapoShuffle: {
    path: '/',
    title: 'DiapoShuffle',
    icon: 'mdi-shuffle-variant',
  },
  export: {
    path: '/export',
    title: 'Export',
    icon: 'mdi-database-export',
  },
  settings: {
    path: '/settings',
    title: 'Settings',
    icon: 'mdi-cog',
  },

  getPageFromPath(path) {
    const pageName = Object.keys(pages).find((key) => pages[key].path === path);
    return pages[pageName];
  },
};

export default pages;
