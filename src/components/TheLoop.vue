<template>
  <v-progress-linear
    class="the-loop"
    :style="{
      transform: dense ? `translateY(${height - 2}px)` : 'translateY(0)'
    }"
    absolute
    bottom
    background-opacity="0.3"
    :value="percentage"
    :color="color"
    :indeterminate="indeterminate"
    :striped="striped"
    :height="height"
    @click="goToLoopStart"
  >
    <span
      v-if="showText"
      :class="['text', { dense }]"
    >
      {{ text }}
    </span>
  </v-progress-linear>
</template>

<script>
import { wait } from '../utils/utils';

const LOOP_STEP = 100; // In ms.
const LOOP_DETERMINATE_COLOR = '#E87B00CC'; // $orange-1 + light opacity.
const LOOP_INDETERMINATE_COLOR = '#2196f3BB'; // primary color + ligth opacity.
const LOOP_DETERMINATE_HEIGHT = 20;
const LOOP_INDETERMINATE_HEIGHT = 4;
const LOOP_ANIMATION_WAIT = 200; // In ms.

function getTimeText (ms, { noMs = false } = {}) {
  const date = new Date(2020, 0, 0);

  date.setMilliseconds(Math.abs(ms));
  const hours = date.getHours();
  const mins = date.getMinutes();
  const seconds = date.getSeconds();
  const dms = date.getMilliseconds();

  let text = '';

  if (hours) { text += `${hours}h ` }
  if (mins) { text += `${mins}m ` }
  text += `${seconds}s `;
  if (!noMs && !hours && !mins && seconds < 10) { text += `${dms / 100}ms` }

  return text;
}

export default {
  name: 'TheLoop',

  props: {
    duration: {
      type: Number,
      default: 3000,
    },

    dense: {
      type: Boolean,
      default: false,
    },

    showRemainingTime: {
      type: Boolean,
      default: false,
    },

    showDurationTime: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    end: null,
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
      let text = '';

      if (this.showRemainingTime) {
        text = this.remainingTimeText;
      }

      if (this.showDurationTime) {
        if (text) { text = `${text} / ` }
        text = `${text}${this.durationTimeText}`;
      }

      return text;
    },

    remainingTimeText () {
      return getTimeText(this.duration - this.value);
    },

    durationTimeText () {
      return getTimeText(this.duration, { noMs: true });
    },

    showText () {
      return (this.showRemainingTime || this.showDurationTime)
        && this.text
        && !this.indeterminate;
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

    async stopLooping () {
      this.clearTimeoutLoop();

      this.isLooping = false;
      this.stop = true;

      await this.goToLoopStart();
    },

    pauseLooping () {
      this.isLooping = false;
      this.pause = true;

      this.clearTimeoutLoop();
    },

    resumeLooping () {
      if (!this.pause) { return }

      this.pause = false;
      this.stop = false;

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
        wait(LOOP_ANIMATION_WAIT).then(() => { this.onLoopEnd() });
      }, this.LOOP_STEP);
    },

    clearTimeoutLoop () { clearTimeout(this.id); this.id = null },

    async goToLoopEnd (options) {
      const prevValue = this.value;

      this.clearTimeoutLoop();
      this.value = this.duration;

      if (prevValue !== this.duration) { await wait(LOOP_ANIMATION_WAIT) }

      this.onLoopEnd(options);
    },

    async goToLoopStart () {
      const prevValue = this.value;
      this.value = 0;

      if (prevValue) { await wait(LOOP_ANIMATION_WAIT) }
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

    onLoopEnd ({ noEvent = false } = {}) {
      this.isLooping = false;
      if (!noEvent) { this.$emit('end') }
    },
  },
};
</script>

<style lang="scss" scoped>
.the-loop {
  z-index: 1000;

  .text {
    font-size: 0.9em;
    font-weight: bold;
    text-shadow: 0 0 2px black;
    transition: opacity 0.3s ease;

    &.dense {
      opacity: 0;
    }
  }
}
</style>
