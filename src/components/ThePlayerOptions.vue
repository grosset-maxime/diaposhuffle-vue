<template>
  <v-container class="the-player-options">
    <v-row align="center">
      <v-col>
        <span class="v-label theme--dark">
          Folder(s)
        </span>

        <v-btn
          class="secondary"
          @click="showFolderBrowser"
        >
          Browse...
        </v-btn>

        <v-btn
          v-if="nbSelectedFolders"
          class="secondary unselect-all-folders-btn"
          @click="onUnselectAllFolders"
        >
          Unselect All
        </v-btn>

        <span
          class="v-label theme--dark nb-selected-folders"
          v-if="nbSelectedFolders"
        >
          Selected: {{ nbSelectedFolders }}
        </span>
      </v-col>
    </v-row>

    <v-row
      align="center"
      v-if="nbSelectedFolders"
    >
      <v-col>
        <v-chip
          v-for="path in folderBrowser.selected"
          :key="path"
          class="mr-3 mt-0 mb-2"
          outlined
          close
          color="blue"
          @click:close="onUnselectFolder(path)"
        >
          {{ path }}
        </v-chip>
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <span class="v-label theme--dark">
          Tag(s)
        </span>

        <v-btn
          class="secondary"
          @click="showTaggerModal"
        >
          Select...
        </v-btn>

        <v-chip
          v-if="nbSelectedTags"
          class="tags-operator-chip ml-5 mr-5 mt-0 mb-0"
          outlined
          color="orange"
          filter
        >
          And
        </v-chip>

        <v-btn
          v-if="nbSelectedTags"
          class="secondary unselect-all-tags-btn"
          @click="onUnselectAllTags"
        >
          Unselect All
        </v-btn>
      </v-col>
    </v-row>

    <v-row
      v-if="taggerModal.selectedTagIds.length"
      align="center"
      class="selected-tags"
    >
      <v-col>
        <TagChip
          v-for="tagId in taggerModal.selectedTagIds"
          :key="tagId"
          :tag-id="tagId"
          close
          @click:close="onUnselectTag"
        />
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
              v-for="(type, i) in availableFilterFileTypes"
              :key="type"
              class="mr-3 mt-0 mb-0"
              outlined
              :color="filterFileTypes.includes(i) ? 'orange' : undefined"
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

    <FolderBrowser
      :show="folderBrowser.show"
      :selected="folderBrowser.selected"
      @close="onCloseFolderBrowser"
      @save="onSaveFolderBrowser"
    />

    <TaggerModal
      :show="taggerModal.show"
      :selected-tag-ids="taggerModal.selectedTagIds"
      @close="onCloseTaggerModal"
      @save="onSaveTaggerModal"
    />
  </v-container>
</template>

<script>
// TODO: Feature: save in user preferences (bdd or localstorage) the choosen options.
// TODO: Feature: Add an option to play in infinite loop for video item.
import {
  INDEX_G_SHOW_THE_PLAYER,
  INDEX_G_SHOW_THE_HELP,
  INDEX_A_PLAYER_START,

  PLAYER_G_FILTER_FILE_TYPES,
  PLAYER_G_FILTERS,
  PLAYER_G_OPTIONS,

  PLAYER_M_FILTERS,
  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
} from '../store/types';
import { getKey } from '../utils/utils';
import FolderBrowser from './FolderBrowser/FolderBrowser.vue';
import TaggerModal from './Tagger/TaggerModal.vue';
import TagChip from './TagChip.vue';

export default {
  name: 'ThePlayerOptions',

  components: {
    FolderBrowser,
    TaggerModal,
    TagChip,
  },

  emits: {
    showTheHelp: null,
  },

  data: () => ({
    folderBrowser: {
      show: false,
      selected: [],
    },

    taggerModal: {
      show: false,
      selectedTagIds: [],
    },

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'player' },

    availableFilterFileTypes () {
      return this.$store.getters[`${this.NS}/${PLAYER_G_FILTER_FILE_TYPES}`];
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

    thePlayer () { return this.$store.getters[INDEX_G_SHOW_THE_PLAYER] },

    theHelp () { return this.$store.getters[INDEX_G_SHOW_THE_HELP] },

    nbSelectedFolders () { return this.folderBrowser.selected.length },

    nbSelectedTags () { return this.taggerModal.selectedTagIds.length },
  },

  watch: {
    thePlayer (onShow) {
      if (onShow) {
        this.removeKeyboardShortcuts();
      } else {
        this.attachKeyboardShortcuts();
      }
    },

    theHelp (onShow) {
      if (onShow) {
        this.removeKeyboardShortcuts();
      } else if (!this.thePlayer) {
        this.attachKeyboardShortcuts();
      }
    },
  },

  mounted () {
    this.attachKeyboardShortcuts();
  },

  methods: {
    showFolderBrowser () {
      this.removeKeyboardShortcuts();
      this.folderBrowser.show = true;
    },

    onCloseFolderBrowser () {
      this.folderBrowser.show = false;
      this.attachKeyboardShortcuts();
    },

    onSaveFolderBrowser (selectedFolders) {
      this.folderBrowser.selected = selectedFolders;
      this.setFolders(selectedFolders);
    },

    onUnselectAllFolders () {
      this.folderBrowser.selected = [];
      this.setFolders([]);
    },

    onUnselectFolder (path) {
      this.folderBrowser.selected = this.folderBrowser.selected.filter((p) => p !== path);
      this.setFolders(this.folderBrowser.selected);
    },

    setFolders (selectedFolders) {
      const folders = [...selectedFolders];
      this.$store.commit(`${this.NS}/${PLAYER_M_FILTERS}`, { folders });
    },

    showTaggerModal () {
      this.removeKeyboardShortcuts();
      this.taggerModal.show = true;
    },

    onCloseTaggerModal () {
      this.taggerModal.show = false;
      this.attachKeyboardShortcuts();
    },

    onSaveTaggerModal (selectedTagIds) {
      this.taggerModal.selectedTagIds = selectedTagIds;
      this.setTags(selectedTagIds);
    },

    onUnselectAllTags () {
      this.taggerModal.selectedTagIds = [];
      this.setTags([]);
    },

    onUnselectTag (tagId) {
      this.taggerModal.selectedTagIds = this.taggerModal.selectedTagIds.filter(
        (id) => id !== tagId,
      );
      this.setTags(this.taggerModal.selectedTagIds);
    },

    setTags (selectedTagIds) {
      this.$store.commit(`${this.NS}/${PLAYER_M_FILTERS}`, { tags: [...selectedTagIds] });
    },

    resetInterval () { this.$store.commit(`${this.NS}/${PLAYER_M_RESET_INTERVAL}`) },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        const key = getKey(e);

        switch (key) {
          case 'Space':
          case 'Enter':
            this.$store.dispatch(INDEX_A_PLAYER_START);
            break;
          case 'b':
            this.showFolderBrowser();
            break;
          case 'h':
            this.$emit('showTheHelp');
            break;
          case 't':
            this.showTaggerModal();
            break;
          default:
        }
      };

      window.addEventListener('keydown', this.keyboardShortcuts.main);
    },

    removeKeyboardShortcuts () {
      window.removeEventListener('keydown', this.keyboardShortcuts.main);
    },
  },

  beforeDestroy () {
    this.removeKeyboardShortcuts();
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

.unselect-all-folders-btn {
  text-transform: none;
  margin-left: 60px;
}

.unselect-all-tags-btn {
  text-transform: none;
}

.nb-selected-folders {
  margin-left: 20px;
}
</style>
