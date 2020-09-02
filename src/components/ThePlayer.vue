<template>
  <div
    :class="['the-player', {
      'opts-show-path': options.showPath
    }]"
  >
    <v-progress-linear
      class="progress-loop"
      :value="loopPercentage"
      :color="loop.color"
      absolute
      top
      :indeterminate="loop.indeterminate"
      :striped="loop.striped"
      @click="resetProgressValue(true)"
      :height="loop.height"
      background-opacity="0.2"
    >
      <span
        v-show="!loop.indeterminate && loopText"
        class="loop-text"
      >
        {{ loopText }}
      </span>
    </v-progress-linear>

    <v-btn
      v-show="pause"
      class="pause-btn"
      @click="resumeLooping()"
      icon
    >
      <div class="pause-icon">
        <div class="stick" />
        <div class="stick" />
      </div>
    </v-btn>

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

    <v-chip
      class="history"
      small
    >
      {{ historyIndex + 1 }} / {{ historyLength }} | {{ itemDisplayedCount }}
    </v-chip>

    <v-dialog
      content-class="delete-modal"
      v-model="deleteModal"
    >
      <div>Delete this item ?</div>
      <v-btn
        class="modal-btn"
        @click="hideDeleteModal({ deleteItem: false })"
      >
        Cancel
      </v-btn>
      <v-btn
        class="modal-btn primary"
        @click="hideDeleteModal({ deleteItem: true })"
      >
        Delete
      </v-btn>
    </v-dialog>

    <div class="items-ctn">
      <div
        v-for="item in getItems()"
        :key="item.name"
        :ref="item.name"
        :class="['item-ctn transition', item.name]"
        :style="item.styles"
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
          disablePictureInPicture
        />
      </div>
    </div>

    <div
      class="path-ctn"
      v-if="options.showPath && hasCurrentItemData"
    >
      <span class="selected-path">
        {{ currentItemSelectedPath }}
      </span>
      <span class="random-path">
        {{ currentItemRandomPath }}
      </span>
    </div>
  </div>
</template>

<script>
import { wait } from '../utils/utils';
import {
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

const defaultVideoOptions = {
  autoplay: false,
  loop: true,
  muted: true,
  controls: true,
  controlsList: ['nofullscreen', 'nodownload', 'noremoteplayback'].join(' '),
};

const LOOP_STEP = 100; // In ms.
const LOOP_DETERMINATE_COLOR = '#2196f380'; // primary color + 50% opacity.
const LOOP_INDETERMINATE_COLOR = '#E87B0080'; // $orange-1 + 50% opacity.
const LOOP_DETERMINATE_HEIGHT = 10;
const LOOP_INDETERMINATE_HEIGHT = 4;

export default {
  name: 'ThePlayer',

  data: () => ({

    // TODO: display history index and length

    loop: {
      id: null,
      value: 0,
      indeterminate: true,
      color: LOOP_DETERMINATE_COLOR,
      striped: false,
      height: LOOP_DETERMINATE_HEIGHT,
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
    itemCustomInterval: 0, // in ms.

    deleteModal: false,

    keyboardShortcuts: {
      player: () => {},
      deleteModal: () => {},
    },

    alert: {
      show: false,
      content: '',
      severity: 'error',
    },
  }),

  computed: {
    NS () { return 'player' },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    LOOP_STEP () { return LOOP_STEP }, // in ms.

    loopPercentage () { return (this.loop.value * 100) / this.loopEndValue },

    loopEndValue () { return this.itemCustomInterval || this.intervalOptions },

    loopText () {
      const date = new Date(2020, 0, 0);

      date.setMilliseconds(Math.abs(this.loopEndValue - this.loop.value));
      const hours = date.getHours();
      const mins = date.getMinutes();
      const seconds = date.getSeconds();
      const ms = date.getMilliseconds();

      let text = '';

      if (hours) { text += `${hours}h ` }
      if (mins) { text += `${mins}m ` }
      text += `${seconds}s `;
      if (!hours && !mins) { text += `${ms / 100}ms` }

      return `${text}`;
    },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },

    currentItemData () { return this[this.currentItemName].data || {} },

    hasCurrentItemData () { return !!Object.keys(this.currentItemData).length },

    currentItemSelectedPath () { return this.currentItemData.customFolderPath },

    currentItemRandomPath () { return this.currentItemData.randomPublicPath },

    itemDisplayedCount () {
      let count = 0;
      this.history.items.forEach((item) => {
        if (item.src === this.currentItemData.src) { count += 1 }
      });
      return count;
    },

    history () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY}`] },

    historyLength () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_LENGTH}`] },

    historyIndex: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_INDEX}`] },
      set (index) { this.$store.commit(`${this.NS}/${PLAYER_M_SET_HISTORY_INDEX}`, index) },
    },
  },

  mounted () {
    this.item1.onLoad = this.onLoadItem1;
    this.item2.onLoad = this.onLoadItem2;
    this.item1.videoOptions.muted = this.options.muteVideo;
    this.item2.videoOptions.muted = this.options.muteVideo;

    this.attachKeyboardPlayerShortcuts();
    this.startLooping();
  },

  methods: {
    startLooping () {
      this.stop = false;
      this.pause = false;

      // Reset history index.
      this.historyIndex = this.historyLength - 1;

      this.currentItemName = 'item1';
      this.onLoopEnd();
    },

    stopLooping () {
      this.stop = true;
      this.clearLoop();
      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pauseLooping () {
      this.pause = true;
      this.clearLoop();
    },

    resumeLooping () {
      if (!this.pause) { return }
      this.pause = false;
      this.looop();
    },

    looop () {
      this.clearLoop();

      if (this.stop || this.pause) {
        this.loop.value -= this.LOOP_STEP;
        return;
      }

      this.loop.id = setTimeout(() => {
        this.loop.value += this.LOOP_STEP;

        // If loop has not yet reach its end, continue to loop.
        if (this.loop.value <= this.loopEndValue) {
          this.looop();
          return;
        }

        // Add timeout to have feeling that loop reach the end.
        wait(200).then(() => { this.onLoopEnd() });
      }, this.LOOP_STEP);
    },

    goToLoopEnd () { this.loop.value = this.loopEndValue },

    goToLoopStart () { this.loop.value = 0 },

    onLoopEnd () {
      // Reset loop here to reset the loop UI before starting next loop.
      this.goToLoopStart();

      if (this.historyLength
        && this.historyIndex < this.historyLength - 1
      ) {
        return wait(100).then(() => this.goToNextItem());
      }

      this.stopPlayingItem(this.currentItemName);

      this.toggleLoopIndeterminate(true);

      return (this.fetchNextItemPromise || this.fetchNextItem()).then(() => {
        this.fetchNextItemPromise = null;

        this.toggleLoopIndeterminate(false);

        return this.animateItems().then(() => {
          this.currentItemName = this.nextItemName;

          this.startPlayingItem(this.currentItemName);

          this.addHistoryItem(this.currentItemData);
          this.historyIndex = this.historyLength - 1;

          this.fetchNextItemPromise = this.fetchNextItem().catch(() => {});

          // Reset loop value here to force staring a new loop from begining.
          this.goToLoopStart();
          this.goingToNextitem = false;

          this.looop();
        });
      }).catch(() => {});
    },

    clearLoop () { clearTimeout(this.loop.id); this.loop.id = null },

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
        this.pauseLooping();
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

    startPlayingItem (itemName) {
      this.itemCustomInterval = this.intervalOptions;

      if (this.isItemVideo(itemName)) {
        const itemRef = this.getItemRef(itemName);
        const videoEl = itemRef.querySelector('.item.vid');
        videoEl.play();
        this.itemCustomInterval = Math.max(videoEl.duration * 1000, this.intervalOptions);
      }
    },

    stopPlayingItem (itemName) {
      this.itemCustomInterval = 0;

      if (this.isItemVideo(itemName)) {
        const itemRef = this.getItemRef(itemName);
        const videoEl = itemRef.querySelector('.item.vid');
        videoEl.pause();
      }
    },

    isItemImage (itemName) { return !this.isItemVideo(itemName) },

    isItemVideo (itemName) { return (this.getItemData(itemName) || {}).isVideo },

    getItem (itemName) { return this[itemName] },

    getItems () { return [this.item1, this.item2] },

    getItemStyles (itemName) { return this.getItem(itemName).styles },

    getItemRef (itemName) { return this.$refs[itemName][0] },

    setItemData (itemName, data) {
      const promise = this.createLoadItemPromise(itemName);
      const item = this.getItem(itemName);

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      item.src = `${data.src}?b=${Date.now()}`;
      item.data = data;

      return promise;
    },

    getItemData (itemName) { return this.getItem(itemName).data },

    clearItemOnLoad (itemName) { this.getItem(itemName).onLoadResolve = null },

    goToNextItem ({ pause = false } = {}) {
      const itemName = this.currentItemName;

      this.clearItemOnLoad(itemName);

      if (this.historyLength
        && this.historyIndex < this.historyLength - 1
      ) {
        this.goToLoopStart();
        if (pause) { this.pauseLooping() }
        return this.goToHistoryItem('next')
          .then(() => {
            this.startPlayingItem(this.currentItemName);
            if (!pause) { this.looop() }
          });
      }

      if (!this.goingToNextitem) {
        this.goingToNextitem = true;
        this.goToLoopEnd();
      }

      this.resumeLooping();

      return Promise.resolve();
    },

    goToPreviousItem ({ pause = false } = {}) {
      const itemName = this.currentItemName;

      this.clearItemOnLoad(itemName);

      this.goToLoopStart();
      if (pause) { this.pauseLooping() }
      return this.goToHistoryItem('previous')
        .then(() => {
          this.startPlayingItem(this.currentItemName);
          if (!pause) { this.looop() }
        });
    },

    goToHistoryItem (direction) {
      const itemName = this.currentItemName;

      this.historyIndex += (direction === 'next' ? 1 : -1);

      if (this.historyIndex < 0) {
        this.historyIndex = 0;
        return Promise.resolve();
      }

      this.toggleLoopIndeterminate(true);
      return this.setItemData(itemName, this.getHistoryItem(this.historyIndex))
        .then(() => { this.toggleLoopIndeterminate(false) });
    },

    getHistoryItem (index) {
      return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_ITEM}`](index);
    },

    addHistoryItem (item) {
      return this.$store.commit(`${this.NS}/${PLAYER_M_ADD_HISTORY_ITEM}`, item);
    },

    resetProgressValue () { this.loop.value = 0 },

    toggleLoopIndeterminate (state = null) {
      const shouldSetInderminate = state !== null
        ? state : !this.loop.indeterminate;

      if (shouldSetInderminate) {
        this.loop.indeterminate = true;
        this.loop.color = LOOP_INDETERMINATE_COLOR;
        this.loop.height = LOOP_INDETERMINATE_HEIGHT;
      } else {
        this.loop.indeterminate = false;
        this.loop.color = LOOP_DETERMINATE_COLOR;
        this.loop.height = LOOP_DETERMINATE_HEIGHT;
      }
    },

    showDeleteModal () {
      this.pauseLooping();
      this.removeKeyboardPlayerShortcuts();
      this.deleteModal = true;
      this.attachKeyboardDeleteModalShortcuts();
    },

    hideDeleteModal ({ deleteItem = false } = {}) {
      this.removeKeyboardDeleteModalShortcuts();
      this.deleteModal = false;
      this.attachKeyboardPlayerShortcuts();

      if (deleteItem) { this.deleteItem(this.currentItemData.src).catch(() => {}) }
    },

    async deleteItem (itemSrc) {
      if (!itemSrc) { return Promise.resolve() }

      this.$store.commit(`${this.NS}/${PLAYER_M_DELETE_HISTORY_ITEM}`, itemSrc);

      this.goToLoopEnd();
      this.resumeLooping();

      let response;
      try {
        response = await this.$store.dispatch(`${this.NS}/${PLAYER_A_DELETE_ITEM}`, itemSrc);
      } catch (e) {
        response = { error: true, publicMessage: e };
      }

      if (response.error) {
        this.pauseLooping();
        this.goToLoopStart();
        this.showAlert({
          content: response.error.publicMessage,
          severity: response.error.severity,
        });

        throw new Error('deleteItem');
      }

      return response;
    },

    showAlert ({ content = 'Unknow error.', severity = 'error' } = {}) {
      this.alert.show = true;
      this.alert.content = content;
      this.alert.severity = severity;
    },

    attachKeyboardPlayerShortcuts () {
      this.keyboardShortcuts.player = (e) => {
        console.log(`code: ${e.code}`);
        switch (e.code) {
          case 'Space':
          case 'Enter':
          case 'ArrowDown':
            if (this.pause) {
              this.resumeLooping();
            } else {
              this.pauseLooping();
            }
            break;

          case 'Escape':
            this.stopLooping();
            break;

          case 'ArrowRight':
            this.goToNextItem({ pause: true });
            break;

          case 'ArrowLeft':
            this.goToPreviousItem({ pause: true });
            break;

          case 'Delete':
            if (this.loop.value < this.loopEndValue || this.pause) {
              this.showDeleteModal();
            }
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts.player);
    },

    attachKeyboardDeleteModalShortcuts () {
      this.keyboardShortcuts.deleteModal = (e) => {
        switch (e.code) {
          case 'Enter':
            this.hideDeleteModal({ deleteItem: true });
            break;

          case 'Escape':
            this.hideDeleteModal({ deleteItem: false });
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts.deleteModal);
    },

    removeKeyboardPlayerShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts.player);
    },
    removeKeyboardDeleteModalShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts.deleteModal);
    },
  },

  beforeDestroy () {
    this.removeKeyboardPlayerShortcuts();
    this.stopLooping();
  },
};
</script>

<style lang="scss" scoped>
.the-player {
  width: 100vw;
  height: 100vh;
  background-color: $grey-8;

  .progress-loop {
    z-index: 1000;

    .loop-text {
      font-size: 0.6em;
    }
  }

  .pause-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    color: $grey-0;
    z-index: 1000;

    .pause-icon {
      display: flex;
      justify-content: center;
      align-items: center;

      .stick {
        width: 5px;
        height: 16px;
        margin: auto 1px;
        background: $grey-0;
        border: 1px solid $grey-7;
      }
    }
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

  .history {
    position: absolute;
    top: 15px;
    left: 5px;
    padding: 0 6px;
    z-index: 1000;
    background-color: $grey-7#{80};
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

  &.opts-show-path {
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

.path-ctn {
  bottom: 5px;
  right: 5px;
  word-break: break-all;
  position: absolute;
  z-index: 1000;
  color: $grey-8;
  background-color: $grey-6#{80};
  padding: 5px;
  border-radius: 5px;
  transition: transform 0.2s ease;

  .selected-path {
    font-size: 1em;
    margin-right: 4px;
  }

  .random-path {
    font-size: 1.5em;
    font-weight: bold;
  }
}
</style>

<style lang="scss">
.delete-modal {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  background: $grey-7#{AA};
  padding: 15px;
  width: 400px;

  .modal-btn {
    width: 100px;
    margin-left: 20px;
  }
}
</style>
