const pages = {
  diapoShuffle: {
    path: '/',
    title: 'DiapoShuffle',
    name: 'diaposhuffle',
    icon: 'mdi-shuffle-variant',
  },
  export: {
    path: '/export',
    title: 'Export',
    name: 'export',
    icon: 'mdi-database-export',
  },
  settings: {
    path: '/settings',
    title: 'Settings',
    name: 'settings',
    icon: 'mdi-cog',
  },
};

export const getPageFromPath = (path) => {
  const pageName = Object.keys(pages).find((key) => pages[key].path === path);
  return pages[pageName];
};

export { pages };
