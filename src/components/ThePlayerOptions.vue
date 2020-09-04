<template>
  <v-container class="the-player-options">
    <v-row align="center">
      <v-col>
        <span class="v-label theme--dark">
          Folder(s)
        </span>
        <v-btn class="secondary">
          Browse...
        </v-btn>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <span class="v-label theme--dark">
          Tag(s)
        </span>
        <v-btn
          class="secondary"
        >
          Select...
        </v-btn>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col class="flex-col">
        <span class="v-label theme--dark">
          Type(s)
        </span>
        <span>
          <v-chip-group
            v-model="filterFileTypes"
            multiple
          >
            <v-chip
              v-for="type in availableFilterFileTypes"
              :key="type"
              class="mr-3 mt-0 mb-0"
              outlined
              filter
            >
              {{ type }}
            </v-chip>
          </v-chip-group>
        </span>
      </v-col>
    </v-row>

    <v-row
      class="mt-4"
      align="center"
    >
      <v-col class="interval-col">
        <v-slider
          v-model="interval"
          min="1"
          max="60"
          label="Interval (s)"
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
          v-model="showPath"
          label="Show path"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showFromPined"
          label="Show picture from pined"
          class="ma-0 pa-0"
          disabled
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showTags"
          label="Show tags"
          class="ma-0 pa-0"
          hide-details
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
  </v-container>
</template>

<script>
import {
  INDEX_A_PLAYER_START,

  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,

  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
  INDEX_G_SHOW_THE_PLAYER,
} from '../store/types';

export default {
  name: 'ThePlayerOptions',

  data: () => ({
    keyboardShortcuts: {
      playerOptions: () => {},
    },
  }),

  computed: {
    NS () { return 'player' },

    availableFilterFileTypes () {
      return this.$store.getters[`${this.NS}/${PLAYER_G_FILTER_FILE_TYPES}`];
    },

    folders: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_FILTERS}`].folders },
      set (folders) { this.$store.commit(`${this.NS}/${PLAYER_M_FILTERS}`, { folders }) },
    },

    tags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_FILTERS}`].tags },
      set (tags) { this.$store.commit(`${this.NS}/${PLAYER_M_FILTERS}`, { tags }) },
    },

    filterFileTypes: {
      get () {
        return this.$store.getters[`${this.NS}/${PLAYER_G_FILTERS}`].fileTypes
          .map((type) => this.availableFilterFileTypes.indexOf(type));
      },
      set (typesIndex) {
        const fileTypes = typesIndex.map((index) => this.availableFilterFileTypes[index]);
        this.$store.commit(`${this.NS}/${PLAYER_M_FILTERS}`, { fileTypes });
      },
    },

    interval: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].interval },
      set (interval) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { interval }) },
    },

    showPath: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showPath },
      set (showPath) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showPath }) },
    },

    showFromPined: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showFromPined },
      set (showFromPined) {
        this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showFromPined });
      },
    },

    showTags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showTags },
      set (showTags) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showTags }) },
    },

    muteVideo: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].muteVideo },
      set (muteVideo) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { muteVideo }) },
    },

    showThePlayer () {
      return this.$store.getters[INDEX_G_SHOW_THE_PLAYER];
    },
  },

  watch: {
    showThePlayer (onShow) {
      if (onShow) {
        this.removeKeyboardPlayerOptionsShortcuts();
      } else {
        this.attachKeyboardPlayerOptionsShortcuts();
      }
    },
  },

  mounted () {
    this.attachKeyboardPlayerOptionsShortcuts();
  },

  methods: {
    resetInterval () { this.$store.commit(`${this.NS}/${PLAYER_M_RESET_INTERVAL}`) },

    attachKeyboardPlayerOptionsShortcuts () {
      this.keyboardShortcuts.playerOptions = (e) => {
        // console.log(`code: ${e.code}`);
        switch (e.code) {
          case 'Space':
          case 'Enter':
            this.$store.dispatch(INDEX_A_PLAYER_START);
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts.playerOptions);
    },

    removeKeyboardPlayerOptionsShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts.playerOptions);
    },
  },

  beforeDestroy () {
    this.removeKeyboardPlayerOptionsShortcuts();
  },
};
</script>

<style lang="scss" scoped>
.the-player-options {
  height: 100%;
  overflow: auto;
  margin-right: 5px;
  @include w-scrollbar;
}
.v-label {
  margin-right: 20px;
}
.interval-col {
  padding-right: 20%;
}
</style>
