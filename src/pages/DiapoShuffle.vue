<template>
  <v-container>
    <v-card
      height="100%"
      color="grey darken-4"
    >
      <v-card-title>
        <v-app-bar-nav-icon
          @click.stop="toggleTheLeftMenu"
          class="mr-4"
        />

        {{ pageTitle }} - Options

        <v-btn
          class="help"
          icon
          @click="showTheHelp"
        >
          <v-icon>mdi-help-circle-outline</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="divider-top ml-3 mr-3" />

      <v-container>
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
            <v-btn class="secondary">
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
                v-model="selectedTypes"
                multiple
              >
                <v-chip
                  v-for="type in types"
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
              label="Show path picture"
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
    </v-card>
  </v-container>
</template>

<script>
import pages from '../pages';

export default {
  name: 'DiapoShuffle',
  data: () => ({
    selectedFolders: [],
    selectedTags: [],
    types: ['JPEG', 'GIF', 'PNG', 'WEBM', 'MP4', 'MKV'],
    selectedTypes: [],
    interval: 3,
    zoom: 1,
    scale: true,
    showPath: true,
    showFromPined: false,
    showTags: true,
    muteVideo: true,
    rules: {
      required: (value) => !!value || 'Required',
    },
  }),
  computed: {
    pageTitle() {
      return (pages.getPageFromPath(this.$route.path) || {}).title || '';
    },
  },
  methods: {
    resetInterval() {
      this.interval = 3;
    },
    toggleTheLeftMenu() {
      this.$store.commit('showTheLeftMenu', !this.$store.state.showTheLeftMenu);
    },
    showTheHelp() {
      this.$store.commit('showTheHelp', !this.$store.state.showTheHelp);
    },
  },
};
</script>

<style lang="scss" scoped>
.v-label {
  margin-right: 20px;
}
.help {
  position: absolute;
  right: 10px;
}
.interval-col {
  padding-right: 20%;
}
</style>
