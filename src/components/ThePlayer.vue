<template>
  <div
    :class="['the-player', {
      'video-item': playingItem.isVideo,
      'show-ui': shouldShowUI,
    }]"
    @mousemove="showUIDuring()"
  >
    <TheLoop
      ref="TheLoop"
      :duration="loopDuration"
      :dense="!shouldShowUI"
      :show-duration-time="playingItem.isVideo"
      show-remaining-time
      @end="goToNextItem"
    />

    <PauseBtn
      v-show="pause"
      class="the-pause-btn"
      @click="resumePlaying"
    />

    <v-alert
      class="alert"
      :value="alert.show"
      :type="alert.severity"
      dismissible
      prominent
      transition="slide-x-transition"
      @input="hideAlert()"
    >
      {{ alert.publicMessage }}
    </v-alert>

    <HistoryChip
      v-show="showTheHistoryChip"
      class="the-history-chip"
      @click="pausePlaying"
    />

    <DeleteModal
      :show="deleteModal.show"
      @confirm="hideDeleteModal({ deleteItem: true })"
      @cancel="hideDeleteModal"
      @click:outside="hideDeleteModal"
    />

    <ItemsPlayer
      ref="ItemsPlayer"
      class="the-items-player"
      :mute-video="muteVideoOption"
      @click="onItemsPlayerClick"
    />

    <!-- TODO: FEATURE: add a dense/contracted mode which will expand on mouse hover -->
    <ItemPathChip
      v-if="options.showPath"
      v-show="showTheItemPathChip"
      class="the-item-path-chip"
      :path-start="playingItemSelectedPath"
      :path-end="playingItemRandomPath"
      @click="pausePlaying"
    />
  </div>
</template>

<script>
// TODO: Enh: Display duration time for video at bottom corner?
// TODO: Feature: For small video try to not fit the screen and apply a scale instead.
// TODO: Feature: Display item's tags.
// TODO: Feature: Allow editing item's tags.
// TODO: Feature: Show nb items and index of current item on playing from bdd items.
// TODO: Bug: Enh: On item fail to load, if it is a 404 not found, remove it from the bdd and fetch a next item.
import {
  ERROR_SEVERITY_INFO,
  buildError,
} from '../api/api';
import { deepClone, getKey } from '../utils/utils';
import {
  INDEX_G_SHOW_THE_HELP,
  INDEX_M_SHOW_THE_HELP,
  INDEX_A_PLAYER_STOP,

  PLAYER_G_OPTIONS,
  PLAYER_G_FILTERS,
  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_DELETE_ITEM,
  PLAYER_A_FETCH_ITEMS_FROM_BDD,
  PLAYER_A_FETCH_ITEMS_FROM_RANDOM,
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

    playingItem: {
      data: undefined,
      isVideo: false,
    },

    nextItem: {
      data: undefined,
    },

    deleteModal: {
      show: false,
    },

    keyboardShortcuts: {
      player: () => {},
    },

    alert: {
      show: false,
      publicMessage: '',
      severity: 'error',
      onClose: () => {},
    },

    fetchNextItemPromise: undefined,

    shouldShowUI: false,
    showUITimeout: undefined,
  }),

  computed: {
    NS () { return 'player' },

    TheLoop () { return this.$refs.TheLoop },

    ItemsPlayer () { return this.$refs.ItemsPlayer },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    filters () { return this.$store.getters[`${this.NS}/${PLAYER_G_FILTERS}`] },

    muteVideoOption () { return this.options.muteVideo },

    intervalOptions () { return this.options.interval * 1000 },

    loopDuration () { return this.loop.duration },

    playingItemData () { return this.playingItem.data },

    playingItemSelectedPath () { return this.playingItemData?.customFolderPath || '' },

    playingItemRandomPath () { return this.playingItemData?.randomPublicPath || '' },

    showTheItemPathChip () { return !!this.playingItemData },

    showTheHistoryChip () { return !!this.historyLength },

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

    // Reset history index.
    this.historyIndex = this.historyLength - 1;

    this.stop = false;
    this.pause = false;

    if (this.filters.tags.length || this.filters.fileTypes.length) {
      this.setLoopIndeterminate(true);
      try {
        await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_ITEMS_FROM_BDD}`);
      } catch (e) {
        const error = buildError(e);

        this.setLoopIndeterminate(false);
        this.showAlert({ ...error, onClose: this.stopPlaying });

        if (error.severity === ERROR_SEVERITY_INFO) {
          return Promise.resolve();
        }

        throw error;
      }
    } else {
      await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_ITEMS_FROM_RANDOM}`);
    }

    this.goToNextItem();

    return Promise.resolve();
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

      if (playItem) { this.startPlayingItem() }
      if (startLooping) { this.TheLoop.startLooping() }
    },

    stopPlaying () {
      this.stop = true;

      this.stopPlayingItem();

      this.TheLoop.stopLooping();

      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying ({ pauseItem = true, pauseLooping = true } = {}) {
      this.pause = true;

      if (pauseItem) { this.pausePlayingItem() }
      if (pauseLooping) { this.TheLoop.pauseLooping() }
    },

    resumePlaying ({ resumeItem = true, resumeLooping = true } = {}) {
      this.stop = false;
      this.pause = false;

      if (resumeItem) { this.resumePlayingItem() }
      if (resumeLooping) { this.TheLoop.resumeLooping() }
    },

    setLoopIndeterminate (state) { this.TheLoop.setIndeterminate(state) },

    async onLoopEnd () {
      await this.TheLoop.stopLooping();

      if (this.stop) { return Promise.resolve() }

      this.setLoopIndeterminate(true);

      let itemData;
      try {
        if (this.nextItem.data) {
          itemData = deepClone(this.nextItem.data);
        } else {
          itemData = await (this.fetchNextItemPromise || this.fetchNextItem());
        }
      } catch (e) {
        this.pausePlaying();
        // TODO: ENH: show error alert.
        return Promise.reject();
      }

      if (this.stop) { return Promise.resolve() }

      // Start fetching the next item of the current next item.
      this.$set(this.nextItem, 'data', undefined);
      this.fetchNextItemPromise = this.fetchNextItem()
        .then((nextItemData) => {
          this.$set(this.nextItem, 'data', nextItemData);
          return nextItemData;
        })
        .catch((error) => {
          console.error('On fetch next Item:', error);
          // TODO: Enh: manage the error, do not try to load next item, and display error message when trying to display next item.
        });

      this.setLoopIndeterminate(false);

      return this.onFetchNextItem(itemData, { animate: true });
    },

    onItemsPlayerClick () {
      if (this.pause) {
        this.resumePlaying();
      } else {
        this.pausePlaying();
      }
    },

    async onFetchNextItem (itemData, { animate = false } = {}) {
      if (this.stop) { return Promise.resolve() }

      // Switch to the next item.
      await this.ItemsPlayer.showNextItem(itemData, { animate });

      if (this.stop) { return Promise.resolve() }

      this.$set(this.playingItem, 'data', itemData);
      this.$set(this.playingItem, 'isVideo', this.ItemsPlayer.isItemVideo());

      return this.playNextItem();
    },

    startPlayingItem () { this.ItemsPlayer.playItem() },

    stopPlayingItem () { this.pausePlayingItem() },

    pausePlayingItem () { this.ItemsPlayer.pauseItem() },

    resumePlayingItem () { this.ItemsPlayer.playItem() },

    setLoopDuration () {
      const itemDuration = this.ItemsPlayer.getItemDuration();
      const duration = Math.max(itemDuration, this.intervalOptions);

      this.$set(this.loop, 'duration', duration);
    },

    async fetchNextItem () {
      let item;
      let error;

      try {
        item = await this.$store.dispatch(
          `${this.NS}/${PLAYER_A_FETCH_NEXT}`,
        );
      } catch (e) {
        error = buildError(e);
        this.showAlert(error);
        throw error;
      }

      // Return next item data.
      return item;
    },

    async goToNextItem ({ pausePlayingIfStillInHistory = false } = {}) {
      if (this.isLoadingItem) { return Promise.resolve() }

      this.isLoadingItem = true;

      return this.goToHistoryItem('next', { pausePlayingIfStillInHistory })
        .finally(() => { this.isLoadingItem = false });
    },

    async goToPreviousItem () {
      if (this.isLoadingItem) { return Promise.resolve() }

      this.isLoadingItem = true;

      this.pausePlaying();

      return this.goToHistoryItem('previous')
        .finally(() => { this.isLoadingItem = false });
    },

    async goToHistoryItem (direction, { pausePlayingIfStillInHistory = false } = {}) {
      if (this.stop) { return Promise.resolve() }

      this.pausePlayingItem();

      const historyIndex = this.historyIndex + (direction === 'next' ? 1 : -1);

      if (historyIndex < 0) {
        this.historyIndex = 0;
        return Promise.resolve();
      }

      // If requested history's index is greater than history length,
      // call onLoopEnd to fetch next item and then add it to the history list.
      if (historyIndex >= this.historyLength) {
        this.resumePlaying({ resumeItem: false, resumeLooping: false });

        this.historyIndex = this.historyLength - 1;

        return this.onLoopEnd()
          .then(() => {
            if (this.stop) { return }

            this.addHistoryItem(this.playingItemData);
            this.historyIndex = this.historyLength - 1;
          })
          .catch(() => {
            // TODO: ENH: Show error alert.
          });
      }

      if (pausePlayingIfStillInHistory) {
        this.pausePlaying({ pauseItem: false, pauseLooping: false });
      }

      await this.TheLoop.stopLooping();

      if (this.stop) { return Promise.resolve() }

      this.historyIndex = historyIndex;

      // Get item data.
      const itemData = this.getHistoryItem(this.historyIndex);

      return this.onFetchNextItem(itemData);
    },

    getHistoryItem (index) {
      return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_ITEM}`](index);
    },

    addHistoryItem (item) {
      return this.$store.commit(`${this.NS}/${PLAYER_M_ADD_HISTORY_ITEM}`, deepClone(item));
    },

    showDeleteModal () {
      this.pausePlaying();
      this.removeKeyboardPlayerShortcuts();

      this.$set(this.deleteModal, 'show', true);
    },

    hideDeleteModal ({ deleteItem = false } = {}) {
      this.$set(this.deleteModal, 'show', false);

      this.attachKeyboardPlayerShortcuts();

      if (deleteItem) {
        this.deleteItem(this.playingItemData.src)
          .catch(() => {
            // TODO: ENH: show error alert.
          });
      }
    },

    async deleteItem (itemSrc) {
      if (!itemSrc) { return Promise.resolve() }

      this.$store.commit(`${this.NS}/${PLAYER_M_DELETE_HISTORY_ITEM}`, itemSrc);

      this.goToNextItem({ pausePlayingIfStillInHistory: true });

      let response;
      let error;

      try {
        response = await this.$store.dispatch(
          `${this.NS}/${PLAYER_A_DELETE_ITEM}`,
          itemSrc,
        );
      } catch (e) {
        error = buildError(e);

        this.pausePlaying();
        this.showAlert(error);

        throw error;
      }

      return response;
    },

    showTheHelp () { this.$store.commit(INDEX_M_SHOW_THE_HELP, true) },

    showAlert ({
      publicMessage = 'Unknow error.',
      severity = 'error',
      onClose = () => {},
    } = {}) {
      this.$set(this, 'alert', {
        publicMessage, severity, onClose, show: true,
      });
    },

    hideAlert () {
      this.$set(this.alert, 'show', false);

      // eslint-disable-next-line no-unused-expressions
      this.alert.onClose?.();
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
            this.goToNextItem({ pausePlayingIfStillInHistory: true });
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

      window.addEventListener('keydown', this.keyboardShortcuts.player);
    },

    removeKeyboardPlayerShortcuts () {
      window.removeEventListener('keydown', this.keyboardShortcuts.player);
    },

    async playNextItem () {
      await this.TheLoop.goToLoopStart();

      this.setLoopDuration();

      if (this.pause) {
        this.TheLoop.pauseLooping();
      } else {
        this.TheLoop.startLooping();
      }

      this.startPlayingItem();
    },

    showUIDuring (time = 2000) {
      this.shouldShowUI = true;

      clearTimeout(this.showUITimeout);
      this.showUITimeout = setTimeout(() => {
        this.hideUI();
      }, time);
    },

    showUI () { this.shouldShowUI = true },

    hideUI () { this.shouldShowUI = false },
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
  cursor: none;

  &.show-ui {
    cursor: default;

    .the-history-chip {
      transform: translateX(0);
    }

    .the-item-path-chip {
      transform: translateX(0);
    }
  }

  &.video-item {
    .the-item-path-chip {
      bottom: 80px; // To not cover the video controls.
    }
  }

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
    top: 5px;
    left: 5px;
    z-index: 1000;
    transform: translateX(-110%);
    transition: transform 0.3s ease;
  }

  .the-item-path-chip {
    position: absolute;
    bottom: 25px;
    right: 5px;
    z-index: 1000;
    transform: translateX(110%);
    transition: transform 0.3s ease;
  }

  .the-items-player {
    position: relative;
  }
}
</style>
