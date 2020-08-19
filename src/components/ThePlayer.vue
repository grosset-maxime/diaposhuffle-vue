<template>
  <div class="the-player">
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
        class="item1 item-ctn transition"
        :style="item1Styles"
        ref="item1"
      >
        <img
          v-show="item1"
          v-if="isItem1Img"
          :src="(item1 || {}).src"
          class="item img"
          @load="onLoadItem1"
        >
        <video
          v-show="item1"
          v-if="isItem1Vid"
          :src="(item1 || {}).src"
          class="item vid"
          :autoplay="item1VideoOptions.autoplay"
          :loop="item1VideoOptions.loop"
          :controls="item1VideoOptions.controls"
          @canplay="onLoadItem1"
        />
      </div>
      <div
        class="item2 item-ctn transition"
        :style="item2Styles"
        ref="item2"
      >
        <img
          v-show="item2"
          v-if="isItem2Img"
          :src="(item2 || {}).src"
          class="item img"
          @load="onLoadItem2"
        >
        <video
          v-show="item2"
          v-if="isItem2Vid"
          :src="(item2 || {}).src"
          class="item vid"
          :autoplay="item2VideoOptions.autoplay"
          :loop="item2VideoOptions.loop"
          :controls="item2VideoOptions.controls"
          @canplay="onLoadItem2"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  INDEX_A_PLAYER_STOP,

  PLAYER_G_OPTIONS,

  PLAYER_A_FETCH_NEXT,
} from '../store/types';

export default {
  name: 'ThePlayer',

  data: () => ({
    LOOP_STEP: 100, // milli-seconds

    loopId: null,

    progress: {
      value: 0,
      indeterminate: true,
      color: 'primary',
      striped: false,
    },

    pause: false,
    stop: true,

    item1: null,
    item2: null,
    item1Styles: {
      /* transfrom: 'translateY(0)' */
      opacity: 1,
    },
    item2Styles: {
      /* transform: 'translateY(100vh)' */
      opacity: 0,
    },
    item1LoadResolve: null,
    item2LoadResolve: null,
    item1VideoOptions: {
      autoplay: false,
      loop: true,
      controls: true,
    },
    item2VideoOptions: {
      autoplay: false,
      loop: true,
      controls: true,
    },

    fetchNextItemPromise: null,
    currentItemName: 'item1',

    keyboardShortcuts: () => {},
  }),

  computed: {
    NS () { return 'player' },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    progressLoopPercent () { return (this.progress.value * 100) / this.intervalOptions },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },

    isItem1Img () { return this.isItemImage(this.item1) },
    isItem2Img () { return this.isItemImage(this.item2) },
    isItem1Vid () { return this.isItemVideo(this.item1) },
    isItem2Vid () { return this.isItemVideo(this.item2) },
  },

  mounted () {
    this.attachKeyboardShortcuts();
    this.startPlaying();
  },

  methods: {
    startPlaying () {
      this.stop = false;
      this.pause = false;

      this.fetchFirstItem().then((item) => {
        this.currentItemName = 'item1';
        const item1LoadPromise = this.createLoadItemPromise(this.currentItemName);
        this.item1 = item; // Item will start to load.
        this.fetchNextItemPromise = this.fetchNextItem();

        item1LoadPromise.then(() => { this.loop() });
      });
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

        if (this.progress.value <= this.intervalOptions) {
          this.loop();
          return;
        }

        setTimeout(() => {
          this.progress.value = 0;

          this.toggleProgressIndeterminate(true);

          (this.fetchNextItemPromise || this.fetchNextItem()).then(() => {
            this.fetchNextItemPromise = null;

            this.toggleProgressIndeterminate(false);

            this.animateItems()
              .then(() => {
                this.currentItemName = this.nextItemName;
                this.fetchNextItemPromise = this.fetchNextItem();

                this.loop();
              });
          });
        }, 200);
      }, this.LOOP_STEP);
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

      const currentItemRef = this.$refs[this.currentItemName];

      const onTransitionEndCurrentItem = () => {
        // this[`${this.currentItemName}Styles`] = {
        //   ...this[`${this.currentItemName}Styles`],
        //   transform: 'translateY(0vh)',
        //   zindex: 0,
        //   opacity: 0,
        // };
        // this[`${this.nextItemName}Styles`] = {
        //   ...this[`${this.nextItemName}Styles`],
        //   transform: 'translateY(0)',
        // };
        currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
        currentItemPromiseResolve();
      };

      currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);

      this[`${this.nextItemName}Styles`] = {
        // transform: 'translateY(0)',
        zindex: 500,
        opacity: 1,
      };
      this[`${this.currentItemName}Styles`] = {
        // transform: 'translateY(-100vh)',
        zindex: 1,
        opacity: 0,
      };

      await currentItemPromise;
    },

    async fetchFirstItem () {
      this.toggleProgressIndeterminate(true);

      const item = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);

      this.toggleProgressIndeterminate(false);

      return item;
    },

    async fetchNextItem () {
      const nextItem = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);

      const loadNextItemPromise = this.createLoadItemPromise(this.nextItemName);
      this[this.nextItemName] = nextItem; // Next item will start to load.

      return loadNextItemPromise;
    },

    createLoadItemPromise (itemName) {
      return new Promise((resolve) => { this[`${itemName}LoadResolve`] = resolve });
    },

    onLoadItem1 () {
      this.item1LoadResolve();
    },

    onLoadItem2 () {
      this.item2LoadResolve();
    },

    isItemImage (item) {
      return !this.isItemVideo(item);
    },

    isItemVideo (item) {
      const vidExtensions = ['webm', 'mp4', 'mkv'];
      const itemExt = ((item || {}).extension || '').toLowerCase();
      return vidExtensions.includes(itemExt);
    },

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
        transition: opacity 500ms linear;
      }

      .item {
        object-fit: contain;
        width: 100%;
        height: 100%;
        outline: none;
      }
    }
  }
}
</style>
