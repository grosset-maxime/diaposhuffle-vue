<template>
  <div
    :class="['the-player', {
      'opts-show-path': options.showPath
    }]"
  >
    <v-progress-linear
      class="progress-loop"
      :value="progressLoopPercent"
      :color="progress.color"
      absolute
      top
      :indeterminate="progress.indeterminate"
      :striped="progress.striped"
      @click="resetProgressValue(true)"
    />

    <v-btn
      v-show="pause"
      class="pause-btn"
      @click="pausePlaying(false)"
      icon
    >
      <div class="pause-icon">
        <div class="stick" />
        <div class="stick" />
      </div>
    </v-btn>

    <div
      class="items-ctn"
    >
      <div
        v-for="itemName in ['item1', 'item2']"
        :key="itemName"
        :ref="itemName"
        :class="['item-ctn transition', itemName]"
        :style="that[itemName].styles"
      >
        <img
          v-show="that[itemName].data"
          v-if="that[`${itemName}IsImg`]"
          :src="(that[itemName].data || {}).src"
          class="item img"
          @load="that[itemName].onLoad"
        >
        <video
          v-show="that[itemName].data"
          v-if="that[`${itemName}IsVid`]"
          :src="(that[itemName].data || {}).src"
          class="item vid"
          :autoplay="that[itemName].videoOptions.autoplay"
          :loop="that[itemName].videoOptions.loop"
          :muted="that[itemName].videoOptions.muted"
          :controls="that[itemName].videoOptions.controls"
          :controlsList="that[itemName].videoOptions.controlsList"
          @canplay="that[itemName].onLoad"
          disablePictureInPicture
        />
      </div>
    </div>

    <div
      class="path-ctn"
      v-show="hasCurrentItemData"
      v-if="options.showPath"
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
import {
  INDEX_A_PLAYER_STOP,

  PLAYER_G_OPTIONS,

  PLAYER_A_FETCH_NEXT,
} from '../store/types';

const defaultVideoOptions = {
  autoplay: false,
  loop: true,
  muted: true,
  controls: true,
  controlsList: ['nofullscreen', 'nodownload', 'noremoteplayback'].join(' '),
};

export default {
  name: 'ThePlayer',

  data: () => ({
    LOOP_STEP: 100, // in ms.

    loopId: null,

    progress: {
      value: 0,
      indeterminate: true,
      color: 'primary',
      striped: false,
    },

    pause: false,
    stop: true,

    item1: {
      data: null,
      styles: { opacity: 1, 'z-index': 500 },
      videoOptions: { ...defaultVideoOptions },
      onLoadResolve: null,
      onLoad: () => {},
    },

    item2: {
      data: null,
      styles: { opacity: 0, 'z-index': 1 },
      videoOptions: { ...defaultVideoOptions },
      onLoadResolve: null,
      onLoad: () => {},
    },

    fetchNextItemPromise: null,
    currentItemName: 'item1',
    itemCustomInterval: 0, // in ms.

    keyboardShortcuts: () => {},
  }),

  computed: {
    that () { return this },

    NS () { return 'player' },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    progressLoopPercent () { return (this.progress.value * 100) / this.progressEnd },

    progressEnd () { return this.itemCustomInterval || this.intervalOptions },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },

    currentItemData () { return this[this.currentItemName].data || {} },

    hasCurrentItemData () { return !!Object.keys(this.currentItemData).length },

    currentItemSelectedPath () { return this.currentItemData.customFolderPath },

    currentItemRandomPath () { return this.currentItemData.randomPublicPath },

    item1IsImg () { return this.isItemImage(this.item1) },
    item1IsVid () { return this.isItemVideo(this.item1) },

    item2IsImg () { return this.isItemImage(this.item2) },
    item2IsVid () { return this.isItemVideo(this.item2) },
  },

  mounted () {
    this.item1.onLoad = this.onLoadItem1;
    this.item2.onLoad = this.onLoadItem2;
    this.item1.videoOptions.muted = this.options.muteVideo;
    this.item2.videoOptions.muted = this.options.muteVideo;

    this.attachKeyboardShortcuts();
    this.startPlaying();
  },

  methods: {
    startPlaying () {
      this.stop = false;
      this.pause = false;

      this.currentItemName = 'item1';
      this.onLoopEnd();
    },

    stopPlaying () {
      this.stop = true;
      this.clearLoop();
      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying (pause = true) {
      this.pause = pause;
      this.clearLoop();

      if (!pause) {
        this.loop();
      }
    },

    loop () {
      if (this.stop || this.pause) {
        this.progress.value -= this.LOOP_STEP;
        return;
      }

      this.loopId = setTimeout(() => {
        this.progress.value += this.LOOP_STEP;

        // If loop has not yet reach its end, continue to loop.
        if (this.progress.value <= this.progressEnd) {
          this.loop();
          return;
        }

        // Add timeout to have feeling that progress reach the end.
        setTimeout(() => { this.onLoopEnd() }, 200);
      }, this.LOOP_STEP);
    },

    async onLoopEnd () {
      this.progress.value = 0;
      this.stopPlayingItem(this.currentItemName);

      this.toggleProgressIndeterminate(true);

      await (this.fetchNextItemPromise || this.fetchNextItem()).then(() => {
        this.fetchNextItemPromise = null;

        this.toggleProgressIndeterminate(false);

        return this.animateItems().then(() => {
          this.currentItemName = this.nextItemName;

          this.startPlayingItem(this.currentItemName);

          this.fetchNextItemPromise = this.fetchNextItem();

          this.loop();
        });
      });
    },

    clearLoop () {
      clearTimeout(this.loopId);
      this.loopId = null;
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

      this[this.nextItemName].styles = {
        'z-index': 500,
        opacity: 1,
      };
      this[this.currentItemName].styles = {
        'z-index': 1,
        opacity: 0,
      };

      await currentItemPromise;
    },

    async fetchNextItem () {
      const nextItemData = await this.$store.dispatch(
        `${this.NS}/${PLAYER_A_FETCH_NEXT}`,
      );

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      nextItemData.src = `${nextItemData.src}?b=${Date.now()}`;

      const loadNextItemPromise = this.createLoadItemPromise(this.nextItemName);
      this[this.nextItemName].data = nextItemData; // Next item will start to load.

      return loadNextItemPromise;
    },

    createLoadItemPromise (itemName) {
      return new Promise(
        (resolve) => { this[itemName].onLoadResolve = resolve },
      );
    },

    onLoadItem1 () {
      this.item1.onLoadResolve();
    },

    onLoadItem2 () {
      this.item2.onLoadResolve();
    },

    startPlayingItem (itemName) {
      if (this.isItemVideo(this[itemName])) {
        const itemRef = this.getItemRef(itemName);
        const videoEl = itemRef.querySelector('.item.vid');
        videoEl.play();
        this.itemCustomInterval = Math.max(videoEl.duration * 1000, this.intervalOptions);
      }
    },

    stopPlayingItem (itemName) {
      this.itemCustomInterval = 0;

      if (this.isItemVideo(this[itemName])) {
        const itemRef = this.getItemRef(itemName);
        const videoEl = itemRef.querySelector('.item.vid');
        videoEl.pause();
      }
    },

    isItemImage (item) {
      return !this.isItemVideo(item);
    },

    isItemVideo (item) {
      const vidExtensions = ['webm', 'mp4', 'mkv'];
      const itemExt = ((item.data || {}).extension || '').toLowerCase();
      return vidExtensions.includes(itemExt);
    },

    getItemStyles (itemName) { return this[itemName].styles },

    getItemRef (itemName) { return this.$refs[itemName][0] },

    resetProgressValue () { this.progress.value = 0 },

    toggleProgressIndeterminate (state = null) {
      const shouldSetInderminate = state !== null
        ? state : !this.progress.indeterminate;

      if (shouldSetInderminate) {
        this.progress.indeterminate = true;
        this.progress.color = '#E87B00'; // $orange-1
      } else {
        this.progress.indeterminate = false;
        this.progress.color = 'primary';
      }
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts = (e) => {
        // console.log(`code: ${e.code}`);
        switch (e.code) {
          case 'Space':
          case 'Enter':
            this.pausePlaying(!this.pause);
            break;

          case 'Escape':
            this.stopPlaying();
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts);
    },

    removeKeyboardShortcuts () { window.removeEventListener('keyup', this.keyboardShortcuts) },
  },

  beforeDestroy () {
    this.removeKeyboardShortcuts();
    this.stopPlaying();
  },
};
</script>

<style lang="scss" scoped>
.the-player {
  width: 100vw;
  height: 100vh;

  .progress-loop {
    z-index: 1000;
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
