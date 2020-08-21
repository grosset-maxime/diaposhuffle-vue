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
          :controls="that[itemName].videoOptions.controls"
          @canplay="that[itemName].onLoad"
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

    item1: {
      data: null,
      styles: {
      /* transfrom: 'translateY(0)' */
        opacity: 1,
      },
      videoOptions: {
        autoplay: false,
        loop: true,
        controls: true,
      },
      onLoadResolve: null,
      onLoad: () => {},
    },

    item2: {
      data: null,
      styles: {
      /* transform: 'translateY(100vh)' */
        opacity: 0,
      },
      videoOptions: {
        autoplay: false,
        loop: true,
        controls: true,
      },
      onLoadResolve: null,
      onLoad: () => {},
    },

    fetchNextItemPromise: null,
    currentItemName: 'item1',

    keyboardShortcuts: () => {},
  }),

  computed: {
    that () { return this },

    NS () { return 'player' },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    progressLoopPercent () { return (this.progress.value * 100) / this.intervalOptions },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },

    item1IsImg () { return this.isItemImage(this.item1) },
    item2IsImg () { return this.isItemImage(this.item2) },

    item1IsVid () { return this.isItemVideo(this.item1) },
    item2IsVid () { return this.isItemVideo(this.item2) },
  },

  mounted () {
    this.item1.onLoad = this.onLoadItem1;
    this.item2.onLoad = this.onLoadItem2;
    this.attachKeyboardShortcuts();
    this.startPlaying();
  },

  methods: {
    startPlaying () {
      this.stop = false;
      this.pause = false;

      this.fetchFirstItem().then((itemData) => {
        this.currentItemName = 'item1';
        const item1LoadPromise = this.createLoadItemPromise(this.currentItemName);
        this.item1.data = itemData; // Item will start to load.
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

      const currentItemRef = this.$refs[this.currentItemName][0];

      const onTransitionEndCurrentItem = () => {
        currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
        currentItemPromiseResolve();
      };

      currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);

      this[this.nextItemName].styles = {
        zindex: 500,
        opacity: 1,
      };
      this[this.currentItemName].styles = {
        zindex: 1,
        opacity: 0,
      };

      await currentItemPromise;
    },

    async fetchFirstItem () {
      this.toggleProgressIndeterminate(true);

      const itemData = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);

      this.toggleProgressIndeterminate(false);

      return itemData;
    },

    async fetchNextItem () {
      const nextItemData = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);

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

    isItemImage (item) {
      return !this.isItemVideo(item);
    },

    isItemVideo (item) {
      const vidExtensions = ['webm', 'mp4', 'mkv'];
      const itemExt = ((item.data || {}).extension || '').toLowerCase();
      return vidExtensions.includes(itemExt);
    },

    getItemStyles (itemName) {
      return this[`${itemName}Styles`];
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
