<template>
  <v-progress-linear
    class="the-loop"
    absolute
    top
    background-opacity="0.2"
    :value="percentage"
    :color="color"
    :indeterminate="indeterminate"
    :striped="striped"
    :height="height"
    @click="goToLoopStart"
  >
    <span
      v-show="showText"
      class="text"
    >
      {{ text }}
    </span>
  </v-progress-linear>
</template>

<script>
import { wait } from '../utils/utils';

const LOOP_STEP = 100; // In ms.
const LOOP_DETERMINATE_COLOR = '#2196f380'; // primary color + 50% opacity.
const LOOP_INDETERMINATE_COLOR = '#E87B0080'; // $orange-1 + 50% opacity.
const LOOP_DETERMINATE_HEIGHT = 10;
const LOOP_INDETERMINATE_HEIGHT = 4;

export default {
  name: 'TheLoop',

  props: {
    duration: {
      type: Number,
      default: 3000,
    },
  },

  emits: {
    onEnd: null,
  },

  data: () => ({
    id: null,
    value: 0,
    indeterminate: true,
    color: LOOP_INDETERMINATE_COLOR,
    striped: false,
    height: LOOP_INDETERMINATE_HEIGHT,

    pause: false,
    stop: false,

    isLooping: false,
  }),

  computed: {
    LOOP_STEP () { return LOOP_STEP }, // in ms.

    percentage () { return (this.value * 100) / this.duration },

    text () {
      const date = new Date(2020, 0, 0);

      date.setMilliseconds(Math.abs(this.duration - this.value));
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

    showText () {
      return this.text && !this.indeterminate;
    },
  },

  methods: {
    startLooping () {
      this.stop = false;
      this.pause = false;

      this.clearTimeoutLoop();
      this.goToLoopStart();
      this.looop();
    },

    stopLooping () {
      this.isLooping = false;
      this.stop = true;

      this.goToLoopStart();
      this.clearTimeoutLoop();
    },

    pauseLooping () {
      this.isLooping = false;
      this.pause = true;

      this.clearTimeoutLoop();
    },

    resumeLooping () {
      if (!this.pause) { return }

      this.pause = false;

      this.looop();
    },

    looop () {
      this.isLooping = true;
      this.clearTimeoutLoop();

      if (this.stop || this.pause) {
        this.value -= this.LOOP_STEP;
        return;
      }

      this.id = setTimeout(() => {
        this.value += this.LOOP_STEP;

        // If loop has not yet reach its end, continue to loop.
        if (this.value <= this.duration) {
          this.looop();
          return;
        }

        // Add timeout to have feeling that loop reach the end.
        wait(200).then(() => { this.onLoopEnd() });
      }, this.LOOP_STEP);
    },

    clearTimeoutLoop () { clearTimeout(this.id); this.id = null },

    goToLoopEnd () {
      this.clearTimeoutLoop();
      this.value = this.duration;
      this.onLoopEnd();
    },

    async goToLoopStart () {
      this.value = 0;
      await wait(100);
    },

    setIndeterminate (isIndeterminate) {
      if (isIndeterminate) {
        this.indeterminate = true;
        this.color = LOOP_INDETERMINATE_COLOR;
        this.height = LOOP_INDETERMINATE_HEIGHT;
      } else {
        this.indeterminate = false;
        this.color = LOOP_DETERMINATE_COLOR;
        this.height = LOOP_DETERMINATE_HEIGHT;
      }
    },

    onLoopEnd () {
      this.isLooping = false;
      this.$emit('onEnd');
    },
  },
};
</script>

<style lang="scss" scoped>
.the-loop {
  z-index: 1000;

  .text {
    font-size: 0.6em;
  }
}
</style>
