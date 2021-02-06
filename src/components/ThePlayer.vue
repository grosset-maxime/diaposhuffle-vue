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
      :value="alert.show"
      class="alert"
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

    <div class="items-ctn">
      <div
        v-for="item in getItems()"
        :key="item.name"
        :ref="item.name"
        :class="['item-ctn transition', item.name]"
        :style="item.styles"
        @click="onItemClick"
      >
        <img
          v-if="item.src && (item.data || {}).isImage"
          :src="item.src"
          class="item img"
          @load="item.onLoad"
        >
        <video
          v-if="item.src && (item.data || {}).isVideo"
          :src="item.src"
          class="item vid"
          :autoplay="item.videoOptions.autoplay"
          :loop="item.videoOptions.loop"
          :muted="item.videoOptions.muted"
          :controls="item.videoOptions.controls"
          :controlsList="item.videoOptions.controlsList"
          @canplay="item.onLoad"
          @pause="onPauseVideo()"
          @play="onPlayVideo()"
          disablePictureInPicture
        />
      </div>
    </div>

    <ItemPathChip
      v-if="options.showPath"
      v-show="hasCurrentItemData"
      class="the-item-path-chip"
      :path-start="currentItemSelectedPath"
      :path-end="currentItemRandomPath"
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
import HistoryChip from './ThePlayer/HistoryChip.vue';

const defaultVideoOptions = {
  autoplay: false,
  loop: true,
  muted: true,
  controls: true,
  controlsList: ['nofullscreen', 'nodownload', 'noremoteplayback'].join(' '),
};

export default {
  name: 'ThePlayer',

  components: {
    TheLoop,
    PauseBtn,
    DeleteModal,
    ItemPathChip,
    HistoryChip,
  },

  data: () => ({
    loop: {
      duration: 0,
    },

    pause: false,
    stop: true,

    item1: {
      name: 'item1',
      src: '',
      data: null,
      styles: { opacity: 1, 'z-index': 500 },
      videoOptions: { ...defaultVideoOptions },
      onLoadResolve: null,
      onLoad: () => {},
    },

    item2: {
      name: 'item2',
      src: '',
      data: null,
      styles: { opacity: 0, 'z-index': 1 },
      videoOptions: { ...defaultVideoOptions },
      onLoadResolve: null,
      onLoad: () => {},
    },

    fetchNextItemPromise: null,
    currentItemName: 'item1',
    goingToNextitem: true,

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
  }),

  computed: {
    NS () { return 'player' },

    TheLoop () { return this.$refs.TheLoop },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    loopDuration () { return this.loop.duration },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },

    currentItemData () { return this[this.currentItemName].data || {} },

    currentItemSrc () { return this.currentItemData.src },

    hasCurrentItemData () { return !!Object.keys(this.currentItemData).length },

    currentItemSelectedPath () { return this.currentItemData.customFolderPath },

    currentItemRandomPath () { return this.currentItemData.randomPublicPath },

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

  mounted () {
    this.item1.onLoad = this.onLoadItem1;
    this.item2.onLoad = this.onLoadItem2;
    this.item1.videoOptions.muted = this.options.muteVideo;
    this.item2.videoOptions.muted = this.options.muteVideo;

    this.attachKeyboardPlayerShortcuts();

    // Reset history index.
    this.historyIndex = this.historyLength - 1;

    this.currentItemName = 'item1';

    this.stop = false;
    this.pause = false;
    this.onLoopEnd();
  },

  methods: {
    startPlaying ({ startLooping = true } = {}) {
      const itemName = this.currentItemName;

      this.stop = false;
      this.pause = false;

      this.TheLoop.goToLoopStart();

      this.startPlayingItem(itemName);

      if (startLooping) {
        this.TheLoop.startLooping();
      }
    },

    stopPlaying () {
      this.stop = true;

      this.stopPlayingItem(this.currentItemName);

      this.TheLoop.stopLooping();

      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying ({ pauseItem = true } = {}) {
      const itemName = this.currentItemName;

      this.pause = true;

      if (pauseItem) {
        this.pausePlayingItem(itemName);
      }

      this.TheLoop.pauseLooping();
    },

    resumePlaying ({ resumeItem = true } = {}) {
      const itemName = this.currentItemName;

      this.pause = false;

      if (resumeItem) {
        this.resumePlayingItem(itemName);
      }

      this.TheLoop.resumeLooping();
    },

    setLoopIndeterminate (state) {
      this.TheLoop.setIndeterminate(state);
    },

    async onLoopEnd () {
      await this.TheLoop.goToLoopStart().then(() => {
        if (this.historyLength
          && this.historyIndex < this.historyLength - 1
        ) {
          return this.goToNextItem({ pausePlaying: false });
        }

        this.pausePlayingItem(this.currentItemName);

        this.setLoopIndeterminate(true);

        return (this.fetchNextItemPromise || this.fetchNextItem()).then(() => {
          this.fetchNextItemPromise = null;

          this.setLoopIndeterminate(false);

          return this.animateItems().then(() => {
            this.currentItemName = this.nextItemName;

            this.addHistoryItem(this.currentItemData);
            this.historyIndex = this.historyLength - 1;

            this.fetchNextItemPromise = this.fetchNextItem().catch(() => {});

            this.goingToNextitem = false;

            this.startPlaying();
          });
        }).catch(() => {});
      });
    },

    async animateItems () {
      if (this.stop) { return }

      let currentItemPromiseResolve;

      const currentItemPromise = new Promise(
        (resolveCurrent) => { currentItemPromiseResolve = resolveCurrent },
      );

      const currentItemRef = this.getItemRef(this.currentItemName);

      const onTransitionEndCurrentItem = () => {
        currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
        currentItemPromiseResolve();
      };

      currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);

      this.getItem(this.nextItemName).styles = {
        'z-index': 500,
        opacity: 1,
      };
      this.getItem(this.currentItemName).styles = {
        'z-index': 1,
        opacity: 0,
      };

      await currentItemPromise;
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
        this.pausePlaying();
        this.showAlert({
          content: response.error.publicMessage,
          severity: response.error.severity,
        });

        throw new Error('fetchNextItem');
      }

      // Next item will start to load.
      return this.setItemData(this.nextItemName, nextItemData);
    },

    createLoadItemPromise (itemName) {
      return new Promise(
        (resolve) => { this.getItem(itemName).onLoadResolve = resolve },
      );
    },

    onLoadItem1 () { this.item1.onLoadResolve() },

    onLoadItem2 () { this.item2.onLoadResolve() },

    onItemClick (e) {
      const { currentItemName } = this;
      const { target } = e;

      let itemEl;

      if (this.isItemImage(currentItemName)) {
        itemEl = this.getImageEl(currentItemName);
      } else if (this.isItemVideo(currentItemName)) {
        itemEl = this.getVideoEl(currentItemName);
      }

      if (target === e.currentTarget
        || target === itemEl
      ) {
        if (this.pause) {
          this.resumePlaying();
        } else {
          this.pausePlaying();
        }
      }
    },

    onPauseVideo () {},

    onPlayVideo () {},

    startPlayingItem (itemName) {
      this.setLoopDuration(itemName);

      if (this.isItemVideo(itemName)) {
        this.playVideo(itemName);
      }
    },

    stopPlayingItem (itemName) {
      if (this.isItemVideo(itemName)) {
        this.pauseVideo(itemName);
      }
    },

    pausePlayingItem (itemName) {
      if (this.isItemVideo(itemName)) {
        this.pauseVideo(itemName);
      }
    },

    resumePlayingItem (itemName) {
      if (this.isItemVideo(itemName)) {
        this.playVideo(itemName);
      }
    },

    pauseVideo (itemName) { this.getVideoEl(itemName).pause() },

    playVideo (itemName) { this.getVideoEl(itemName).play() },

    isItemImage (itemName) { return !this.isItemVideo(itemName) },

    isItemVideo (itemName) { return (this.getItemData(itemName) || {}).isVideo },

    getItem (itemName) { return this[itemName] },

    getItems () { return [this.item1, this.item2] },

    getItemStyles (itemName) { return this.getItem(itemName).styles },

    getItemRef (itemName) { return this.$refs[itemName][0] },

    getImageEl (itemName) {
      return this.getItemRef(itemName).querySelector('.item.img');
    },

    getVideoEl (itemName) {
      return this.getItemRef(itemName).querySelector('.item.vid');
    },

    setItemData (itemName, data) {
      const promise = this.createLoadItemPromise(itemName);
      const item = this.getItem(itemName);

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      item.src = `${data.src}?b=${Date.now()}`;
      item.data = data;

      return promise;
    },

    setLoopDuration (itemName) {
      let duration = this.intervalOptions;

      if (this.isItemVideo(itemName)) {
        const videoEl = this.getVideoEl(itemName);
        duration = Math.max(videoEl.duration * 1000, this.intervalOptions);
      }

      this.loop.duration = duration;
    },

    getItemData (itemName) { return this.getItem(itemName).data },

    clearItemOnLoad (itemName) { this.getItem(itemName).onLoadResolve = null },

    goToNextItem ({ pausePlaying = true } = {}) {
      const itemName = this.currentItemName;

      this.clearItemOnLoad(itemName);

      if (this.historyLength
        && this.historyIndex < this.historyLength - 1
      ) {
        if (pausePlaying) { this.pausePlaying() }

        return this.goToHistoryItem('next')
          .then(() => {
            this.startPlaying({ startLooping: !pausePlaying });

            if (pausePlaying) {
              this.TheLoop.goToLoopStart();
              this.pausePlaying({ pauseItem: false });
            }
          });
      }

      if (!this.goingToNextitem) {
        this.goingToNextitem = true;
        this.TheLoop.goToLoopEnd();
      }

      return Promise.resolve();
    },

    goToPreviousItem ({ pausePlaying = true } = {}) {
      const itemName = this.currentItemName;

      this.clearItemOnLoad(itemName);

      this.TheLoop.goToLoopStart();

      if (pausePlaying) { this.pausePlaying() }

      return this.goToHistoryItem('previous')
        .then(() => {
          this.startPlaying({ startLooping: !pausePlaying });

          if (pausePlaying) {
            this.TheLoop.goToLoopStart();
            this.pausePlaying({ pauseItem: false });
          }
        });
    },

    goToHistoryItem (direction) {
      const itemName = this.currentItemName;

      this.historyIndex += (direction === 'next' ? 1 : -1);

      if (this.historyIndex < 0) {
        this.historyIndex = 0;
        return Promise.resolve();
      }

      this.setLoopIndeterminate(true);
      return this.setItemData(itemName, this.getHistoryItem(this.historyIndex))
        .then(() => { this.setLoopIndeterminate(false) });
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

      if (deleteItem) { this.deleteItem(this.currentItemSrc).catch(() => {}) }
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
        this.TheLoop.goToLoopStart();
        this.pausePlaying();

        this.showAlert({
          content: response.error.publicMessage,
          severity: response.error.severity,
        });

        throw new Error('deleteItem');
      }

      return response;
    },

    showTheHelp () {
      this.$store.commit(INDEX_M_SHOW_THE_HELP, true);
    },

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
            this.goToPreviousItem({ pausePlaying: true });
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
  },

  beforeDestroy () {
    this.removeKeyboardPlayerShortcuts();
    this.stopPlaying();
  },
};
</script>

<style lang="scss" scoped>
.the-player {
  width: 100vw;
  height: 100vh;
  background-color: $grey-8;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;

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
    bottom: 5px;
    right: 5px;
    position: absolute;
    z-index: 1000;
  }

  .items-ctn {
    width: 100%;
    height: 100%;
    position: relative;

    .item-ctn {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;

      &.transition {
        transition: opacity 300ms linear;
      }

      .item {
        object-fit: contain;
        width: 100%;
        height: 100%;
        outline: none;
      }

      .item.vid {
        &::-webkit-media-controls-fullscreen-button,
        &::-webkit-media-controls-download-button {
          display: none;
        }
      }
    }
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
