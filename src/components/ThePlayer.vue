<template>
  <div
    :class="['the-player', {
      'opts-show-the-item-path-chip': options.showPath
    }]"
  >
    <TheLoop
      ref="TheLoop"
      :duration="loopDuration"
      @onEnd="onLoopEnd"
    />

    <PauseBtn
      v-show="pause"
      class="the-pause-btn"
      @onClick="resumePlaying"
    />

    <v-alert
      class="alert"
      :value="alert.show"
      :type="alert.severity"
      dismissible
      prominent
      transition="slide-x-transition"
      @input="alert.show = false"
    >
      {{ alert.content }}
    </v-alert>

    <HistoryChip
      v-show="!!historyLength"
      class="the-history-chip"
      @onClick="pausePlaying"
    />

    <DeleteModal
      :show="deleteModal.show"
      @onConfirm="hideDeleteModal({ deleteItem: true })"
      @onCancel="hideDeleteModal({ deleteItem: false })"
    />

    <ItemsPlayer
      class="the-items-player"
      v-bind.sync="itemsPlayer.triggers"
      :next-item-data="itemsPlayer.props.nextItemData"
      :animate-switch-items="itemsPlayer.props.animateSwitchItems"
      :mute-video="itemsPlayer.props.muteVideo"
      @onClick="onItemsPlayerClick"
      @onPlayingNextItem="onPlayingNextItem"
      @playingItemDuration="setLoopDuration"
    />

    <ItemPathChip
      v-if="options.showPath"
      v-show="showTheItemPathChip"
      class="the-item-path-chip"
      :path-start="playingItemSelectedPath"
      :path-end="playingItemRandomPath"
      @onClick="pausePlaying"
    />
  </div>
</template>

<script>
import { getKey } from '../utils/utils';
import {
  INDEX_G_SHOW_THE_HELP,
  INDEX_M_SHOW_THE_HELP,
  INDEX_A_PLAYER_STOP,

  PLAYER_G_OPTIONS,
  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_DELETE_ITEM,
} from '../store/types';
import TheLoop from './TheLoop.vue';
import PauseBtn from './PauseBtn.vue';
import DeleteModal from './DeleteModal.vue';
import ItemPathChip from './ItemPathChip.vue';
import ItemsPlayer from './ItemsPlayer.vue';
import HistoryChip from './ThePlayer/HistoryChip.vue';

export default {
  name: 'ThePlayer',

  components: {
    TheLoop,
    PauseBtn,
    DeleteModal,
    ItemPathChip,
    ItemsPlayer,
    HistoryChip,
  },

  data: () => ({
    loop: {
      duration: 0,
    },

    pause: false,
    stop: true,

    itemsPlayer: {
      triggers: {
        triggerShowNextItem: false,
        triggerPauseItem: false,
        triggerPlayItem: false,
      },

      props: {
        nextItemData: undefined,
        animateSwitchItems: true,
        muteVideo: true,
      },

      playingItemData: undefined,
    },

    deleteModal: {
      show: false,
    },

    keyboardShortcuts: {
      player: () => {},
    },

    alert: {
      show: false,
      content: '',
      severity: 'error',
    },

    fetchNextItemPromise: undefined,

    nextItemStates: {
      startLooping: true,
      playItem: true,
      pause: false,
    },

    isNavigatingIntoHistory: false,
  }),

  computed: {
    NS () { return 'player' },

    TheLoop () { return this.$refs.TheLoop },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    loopDuration () { return this.loop.duration },

    playingItemData () { return this.itemsPlayer.playingItemData },

    playingItemSelectedPath () {
      return (this.playingItemData || {}).customFolderPath || '';
    },

    playingItemRandomPath () { return (this.playingItemData || {}).randomPublicPath || '' },

    showTheItemPathChip () { return !!this.playingItemData },

    history () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY}`] },

    historyLength () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_LENGTH}`] },

    historyIndex: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_INDEX}`] },
      set (index) { this.$store.commit(`${this.NS}/${PLAYER_M_SET_HISTORY_INDEX}`, index) },
    },

    theHelp () { return this.$store.getters[INDEX_G_SHOW_THE_HELP] },
  },

  watch: {
    theHelp (onShow) {
      if (onShow) {
        this.removeKeyboardPlayerShortcuts();
      } else {
        this.attachKeyboardPlayerShortcuts();
      }
    },
  },

  async mounted () {
    this.attachKeyboardPlayerShortcuts();

    this.itemsPlayer.props.muteVideo = this.options.muteVideo;

    // Reset history index.
    this.historyIndex = this.historyLength - 1;

    this.stop = false;
    this.pause = false;

    this.onLoopEnd();

    // TODO: remove TheLoopRef
  },

  updated () {
  },

  beforeDestroy () {
    this.removeKeyboardPlayerShortcuts();
    this.stopPlaying();
  },

  methods: {
    startPlaying ({ startLooping = true, playItem = true } = {}) {
      this.stop = false;
      this.pause = false;

      this.TheLoop.goToLoopStart();

      if (playItem) {
        this.startPlayingItem();
      }

      if (startLooping) {
        this.TheLoop.startLooping();
      }
    },

    stopPlaying () {
      this.stop = true;

      this.stopPlayingItem();

      this.TheLoop.stopLooping();

      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying ({ pauseItem = true, pauseLooping = true } = {}) {
      this.pause = true;

      if (pauseItem) {
        this.pausePlayingItem();
      }

      if (pauseLooping) {
        this.TheLoop.pauseLooping();
      }
    },

    resumePlaying ({ resumeItem = true, resumeLooping = true } = {}) {
      this.pause = false;

      if (resumeItem) {
        this.resumePlayingItem();
      }

      if (resumeLooping) {
        this.TheLoop.resumeLooping();
      }
    },

    setLoopIndeterminate (state) { this.TheLoop.setIndeterminate(state) },

    async onLoopEnd () {
      await this.TheLoop.stopLooping();

      if (this.isNavigatingIntoHistory) {
        return this.goToNextItem();
      }

      this.nextItemStates.startLooping = true;
      this.nextItemStates.playItem = true;
      this.nextItemStates.pause = false;

      this.setLoopIndeterminate(true);

      let nextItemData;
      try {
        nextItemData = await (this.fetchNextItemPromise || this.fetchNextItem());
      } catch (e) {
        this.pausePlaying();
        return Promise.resolve();
      }

      // Next item will start to load.
      this.itemsPlayer.props.nextItemData = nextItemData;

      this.fetchNextItemPromise = this.fetchNextItem().catch(() => {});

      this.itemsPlayer.props.animateSwitchItems = true;

      // Next tick need to have time to set nextItemData before applying
      // showNextItem.
      await this.$nextTick();

      // Trigger ItemsPlayer to switch to the next item.
      this.itemsPlayer.triggers.triggerShowNextItem = !this.stop;

      return Promise.resolve();
    },

    startPlayingItem () { this.itemsPlayer.triggers.triggerPlayItem = true },

    stopPlayingItem () { this.pausePlayingItem() },

    pausePlayingItem () { this.itemsPlayer.triggers.triggerPauseItem = true },

    resumePlayingItem () { this.itemsPlayer.triggers.triggerPlayItem = true },

    setLoopDuration () {
      this.loop.duration = Math.max(this.playingItemData.duration, this.intervalOptions);
    },

    async fetchNextItem () {
      let response;
      let nextItemData;

      try {
        response = await this.$store.dispatch(
          `${this.NS}/${PLAYER_A_FETCH_NEXT}`,
        );
      } catch (e) {
        response = { error: true, publicMessage: e };
      }

      if (response.success) {
        nextItemData = response.item;
      } else {
        this.showAlert({
          content: response.error.publicMessage,
          severity: response.error.severity,
        });

        throw new Error('fetchNextItem');
      }

      return nextItemData;
    },

    async goToNextItem ({ pausePlaying = true } = {}) {
      if (pausePlaying) {
        this.nextItemStates.playItem = true;
        this.nextItemStates.startLooping = false;
        this.nextItemStates.pause = true;
      }

      await this.TheLoop.stopLooping();

      return this.goToHistoryItem('next');
    },

    async goToPreviousItem () {
      this.isNavigatingIntoHistory = true;

      this.nextItemStates.playItem = true;
      this.nextItemStates.startLooping = false;
      this.nextItemStates.pause = true;

      await this.TheLoop.stopLooping();

      return this.goToHistoryItem('previous');
    },

    async goToHistoryItem (direction) {
      const historyIndex = this.historyIndex + (direction === 'next' ? 1 : -1);

      if (historyIndex < 0) {
        this.historyIndex = 0;
        return Promise.resolve();
      }

      if (historyIndex >= this.historyLength) {
        this.historyIndex = this.historyLength - 1;
        this.isNavigatingIntoHistory = false;
        return this.onLoopEnd();
      }

      this.historyIndex = historyIndex;

      // Next item will start to load.
      this.itemsPlayer.props.nextItemData = this.getHistoryItem(this.historyIndex);

      this.itemsPlayer.props.animateSwitchItems = false;

      // Next tick need to have time to set nextItemData before applying
      // showNextItem.
      await this.$nextTick();

      this.setLoopIndeterminate(true);

      // Trigger ItemsPlayer to switch to the next item.
      this.itemsPlayer.triggers.triggerShowNextItem = !this.stop;

      return Promise.resolve();
    },

    getHistoryItem (index) {
      return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_ITEM}`](index);
    },

    addHistoryItem (item) {
      return this.$store.commit(`${this.NS}/${PLAYER_M_ADD_HISTORY_ITEM}`, item);
    },

    showDeleteModal () {
      this.pausePlaying();
      this.removeKeyboardPlayerShortcuts();

      this.deleteModal.show = true;
    },

    hideDeleteModal ({ deleteItem = false } = {}) {
      this.deleteModal.show = false;

      this.attachKeyboardPlayerShortcuts();

      if (deleteItem) {
        this.deleteItem(this.itemsPlayer.playingItemData.src)
          .catch(() => {});
      }
    },

    async deleteItem (itemSrc) {
      if (!itemSrc) { return Promise.resolve() }

      this.$store.commit(`${this.NS}/${PLAYER_M_DELETE_HISTORY_ITEM}`, itemSrc);

      this.onLoopEnd();

      let response;
      try {
        response = await this.$store.dispatch(`${this.NS}/${PLAYER_A_DELETE_ITEM}`, itemSrc);
      } catch (e) {
        response = { error: true, publicMessage: e };
      }

      if (response.error) {
        this.TheLoop.stopLooping();
        this.pausePlaying();

        this.showAlert({
          content: response.error.publicMessage,
          severity: response.error.severity,
        });

        throw new Error('deleteItem');
      }

      return response;
    },

    showTheHelp () { this.$store.commit(INDEX_M_SHOW_THE_HELP, true) },

    showAlert ({ content = 'Unknow error.', severity = 'error' } = {}) {
      this.alert.show = true;
      this.alert.content = content;
      this.alert.severity = severity;
    },

    attachKeyboardPlayerShortcuts () {
      this.keyboardShortcuts.player = (e) => {
        // console.log('ThePlayer e:', e);

        const key = getKey(e);
        switch (key) {
          case 'Space':
            if (this.pause) {
              this.resumePlaying();
            } else {
              this.pausePlaying();
            }
            break;

          // On ArrowDown only pause/resume looping to allow to play video in
          // infinite loop if wanted.
          case 'ArrowDown':
            if (this.pause) {
              this.resumePlaying({ resumeItem: false });
            } else {
              this.pausePlaying({ pauseItem: false });
            }
            break;

          case 'Escape':
            this.stopPlaying();
            break;

          case 'ArrowRight':
            this.goToNextItem({ pausePlaying: true });
            break;

          case 'ArrowLeft':
            this.goToPreviousItem();
            break;

          case 'Delete':
            if (this.TheLoop.value < this.loopDuration || this.pause) {
              this.showDeleteModal();
            }
            break;
          case 'h':
            this.pausePlaying();
            this.showTheHelp();
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts.player);
    },

    removeKeyboardPlayerShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts.player);
    },

    onItemsPlayerClick () {
      if (this.pause) {
        this.resumePlaying();
      } else {
        this.pausePlaying();
      }
    },

    async onPlayingNextItem (playingItemData) {
      this.itemsPlayer.playingItemData = playingItemData;

      this.setLoopIndeterminate(false);

      await this.TheLoop.goToLoopStart();

      this.setLoopDuration();

      if (this.nextItemStates.playItem) {
        this.startPlayingItem();
      } else {
        this.pausePlayingItem();
      }

      if (this.nextItemStates.startLooping) {
        this.TheLoop.startLooping();
      } else {
        this.TheLoop.pauseLooping();
      }

      this.pause = this.nextItemStates.pause;

      if (!this.isNavigatingIntoHistory) {
        this.addHistoryItem(playingItemData);
        this.historyIndex = this.historyLength - 1;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.the-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: $grey-8;

  .the-pause-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1000;
  }

  .alert {
    $margin: 10px;
    z-index: 2000;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - #{$margin * 2});
    margin: $margin;
  }

  .the-history-chip {
    position: absolute;
    top: 15px;
    left: 5px;
    z-index: 1000;
  }

  .the-item-path-chip {
    position: absolute;
    bottom: 5px;
    right: 5px;
    z-index: 1000;
  }

  .the-items-player {
    position: relative;
  }

  &.opts-show-the-item-path-chip {
    .item.vid {
      &::-webkit-media-controls-panel {
        transition: transform 0.2s ease;
        transform: translateY(0);
      }
      &:hover {
        &::-webkit-media-controls-panel {
          transform: translateY(-60px);
        }
      }
    }
  }
}
</style>
