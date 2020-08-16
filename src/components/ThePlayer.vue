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
      class="img-ctn"
      @click="pausePlaying(!pause)"
    >
      <img
        v-if="next"
        :src="next"
        class="img"
      >
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

    next: null,
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

      this.fetchNext().then((next) => {
        this.next = next;
        this.loop();
      });
    },

    stopPlaying () {
      this.stop = true;
      this.clearLoop();
      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying (pause) {
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

          setTimeout(() => {
            this.fetchNext().then((next) => {
              // console.log(next);
              this.next = next;
              this.loop();
            });
          }, 500);
        }, 500);
      }, this.LOOP_STEP);
    },

    clearLoop () {
      clearTimeout(this.loopId);
      this.loopId = null;
    },

    async fetchNext () {
      this.toggleProgressIndeterminate(true);

      const next = await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_NEXT}`);

      this.toggleProgressIndeterminate(false);

      return next;
    },

    resetProgressValue () {
      this.progress.value = 0;
    },

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

  .pause-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    color: $grey-0;

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

  .img-ctn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .img {
      object-fit: contain;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
