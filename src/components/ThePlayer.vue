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
      @click="pausePlaying(!pause)"
    >
      <div
        class="item1 item-ctn transition"
        :style="item1Styles"
        ref="item1"
      >
        <img
          v-show="item1"
          :src="(item1 || {}).src"
          class="item img"
          @load="onLoadItem1"
        >
      </div>
      <div
        class="item2 item-ctn transition"
        :style="item2Styles"
        ref="item2"
      >
        <img
          v-show="item2"
          :src="(item2 || {}).src"
          class="item img"
          @load="onLoadItem2"
        >
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
      indeterminate: false,
      color: 'primary',
      striped: false,
    },

    pause: false,
    stop: true,

    item1: null,
    item2: null,
    item1Styles: { transfrom: 'translateY(0)' },
    item2Styles: {
      transform: 'translateY(100vh)',
    },
    // showItem: 'item1',
    // showItem1: true,
    // showItem2: false,
    nextItemPromise: null,
    currentItemName: 'item1',

    keyboardShortcuts: () => {},
  }),

  computed: {
    NS () { return 'player' },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    intervalOptions () { return this.options.interval * 1000 },

    progressLoopPercent () { return (this.progress.value * 100) / this.intervalOptions },
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
        this.item1 = item;
        this.currentItemName = 'item1';
        this.showItem = this.currentItemName;
        this.nextItemPromise = this.fetchNextItem();

        console.log('show item: ', this.currentItemName);
        console.log('show item:', this[this.currentItemName]);
        this.loop();
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

          (this.nextItemPromise || this.fetchNextItem()).then((nextItem) => {
            const nextItemName = this.currentItemName === 'item1' ? 'item2' : 'item1';
            this.nextItemPromise = null;

            // const nextItemRef = this.$refs[nextItemName];
            // nextItemRef.addEventListener()
            this[nextItemName] = nextItem;

            this.toggleProgressIndeterminate(false);

            this.animateItems({ nextItemName }).then(() => {
              this.currentItemName = nextItemName;
              this.nextItemPromise = this.fetchNextItem();

              // console.log('show item: ', this.currentItemName);
              // console.log('show item:', this[this.currentItemName]);
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

    async animateItems ({ nextItemName }) {
      // let nextItemPromiseResolve;
      let currentItemPromiseResolve;

      // const nextItemPromise = new Promise(
      //   (resolveNext) => { nextItemPromiseResolve = resolveNext },
      // );
      const currentItemPromise = new Promise(
        (resolveCurrent) => { currentItemPromiseResolve = resolveCurrent },
      );

      // const nextItemRef = this.$refs[nextItemName];
      const currentItemRef = this.$refs[this.currentItemName];

      // const onTransitionEndNextItem = () => {
      //   nextItemRef.removeEventListener('transitionend', onTransitionEndNextItem);
      //   nextItemPromiseResolve();
      // };

      const onTransitionEndCurrentItem = () => {
        this[`${this.currentItemName}Styles`] = {
          ...this[`${this.currentItemName}Styles`],
          transform: 'translateY(100vh)',
          zindex: 0,
          opacity: 0,
        };
        currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
        currentItemPromiseResolve();
      };

      // nextItemRef.addEventListener('transitionend', onTransitionEndNextItem, false);
      currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);

      this[`${nextItemName}Styles`] = {
        transform: 'translateY(0)',
        zindex: 500,
        opacity: 1,
      };
      this[`${this.currentItemName}Styles`] = {
        transform: 'translateY(-100vh)',
        zindex: 500,
        opacity: 1,
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
      const next = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);
      return next;
    },

    onLoadItem1 () {
      // this.
    },

    onLoadItem2 () {
      console.log('onLoadItem2');
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
        transition: transform 500ms linear;
      }

      .item {
        object-fit: contain;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
