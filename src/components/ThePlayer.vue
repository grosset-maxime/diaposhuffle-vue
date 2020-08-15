<template>
  <div class="the-player">
    <img src="/pic/test/bbb/a.gif">
    <div>
      {{ i }}
    </div>
    <v-btn
      class="primary"
      @click="stopPlaying"
    >
      Stop
    </v-btn>
  </div>
</template>

<script>
import {
  INDEX_A_PLAYER_STOP,

  PLAYER_G_START,
  PLAYER_G_OPTIONS,

  PLAYER_M_START,
} from '../store/types';

export default {
  name: 'ThePlayer',

  data: () => ({
    loopId: null,
    i: 0,
  }),

  computed: {
    NS () { return 'player' },

    start: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_START}`] },
      set (start) { this.$store.commit(`${this.NS}/${PLAYER_M_START}`, start) },
    },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },
    intervalOptions () { return this.options.interval * 1000 },
  },

  mounted () {
    this.startPlaying();
  },

  methods: {
    startPlaying () {
      this.loopId = setInterval(() => {
        console.log(this.i += 1);
      }, this.intervalOptions);
    },

    stopPlaying () {
      this.clearLoop();
      // this.$store.dispatch(`${this.NS}/${PLAYER_A_STOP_PLAYING}`);
      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    clearLoop () {
      clearInterval(this.loopId);
      this.loopId = null;
    },
  },

  beforeDestroy () {
    this.stopPlaying();
  },
};
</script>

<style lang="scss" scoped>

</style>
