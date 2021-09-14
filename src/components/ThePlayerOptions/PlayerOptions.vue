<template>
  <v-container class="player-options">
    <v-row
      class="mt-4"
      align="center"
    >
      <v-col class="interval-col">
        <v-slider
          v-model="interval"
          min="1"
          max="60"
          label="Interval"
          @click:append="resetInterval"
          append-icon="mdi-close"
          thumb-label="always"
          thumb-size="24"
          hint="1 - 60 seconds"
          persistent-hint
          ticks
          dense
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="muteVideo"
          label="Mute video"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="fetchItemRandomly"
          label="Fetch Item Randomly"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// TODO: Feature: Add an option to play in infinite loop for video item.
import {
  PLAYER_G_OPTIONS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
} from '../../store/types';

export default {
  name: 'PlayerOptions',

  components: {},

  emits: {},

  data: () => ({}),

  computed: {
    NS () { return 'player' },

    interval: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].interval },
      set (interval) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { interval }) },
    },

    muteVideo: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].muteVideo },
      set (muteVideo) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { muteVideo }) },
    },

    fetchItemRandomly: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].fetchItemRandomly },
      set (fetchItemRandomly) {
        this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { fetchItemRandomly });
      },
    },
  },

  // watch: {},

  // mounted () {},

  methods: {
    resetInterval () { this.$store.commit(`${this.NS}/${PLAYER_M_RESET_INTERVAL}`) },
  },

  // beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.player-options {
  .interval-col {
    padding-right: 20%;
  }

  .v-label {
    margin-right: 20px;
  }
}
</style>
