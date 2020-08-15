import {
  INDEX_A_STOP_PLAYING,
} from '../store/types';

const Player = {
  store: null,

  init (options = {}) {
    this.store = options.store;
  },

  start () {
    setTimeout(() => {
      this.store.dispatch(INDEX_A_STOP_PLAYING);
    }, 2000);
  },
};

export default Player;
