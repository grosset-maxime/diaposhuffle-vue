<template>
  <v-container class="source-options">
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
          @click="toggleTagsOperator"
        >
          {{ tagsOperatorText }}
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

    <v-row align="center">
      <v-col class="pineds-col">
        <v-switch
          class="ma-0 pa-0"
          v-model="fromPined"
          :label="`Pined items - ${pinedsLength}`"
          :disabled="!pinedsLength"
          hide-details
          inset
        />
        <v-btn
          :class="['ml-2', {
            'clear-pineds-hide': !pinedsLength
          }]"
          :disabled="!pinedsLength"
          icon
          @click="clearPineds"
        >
          <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>
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
// TODO: Feature: Add a component to create custom tags operator (aaa AND bbb OR ccc)
// TODO: Feature: Add a filter by: image or video types. DONE ?
// TODO: Enh: dispable tag operator chip if only one tag is selected.
import {
  PLAYER_OPTS_SRC_G_AVAILABLE_FILE_TYPES,
  PLAYER_OPTS_SRC_G_TAGS,
  PLAYER_OPTS_SRC_G_TAGS_OPERATOR,
  PLAYER_OPTS_SRC_G_FILE_TYPES,
  PLAYER_OPTS_SRC_G_FROM_PINED,

  PLAYER_OPTS_SRC_M_TOGGLE_TAGS_OPERATOR,
  PLAYER_OPTS_SRC_M_SOURCE_OPTIONS,

  PLAYER_G_PINEDS_LENGTH,
  PLAYER_M_CLEAR_PINEDS,
} from '../../store/types';
import FolderBrowser from '../FolderBrowser/FolderBrowser.vue';
import TaggerModal from '../Tagger/TaggerModal.vue';
import TagChip from '../TagChip.vue';

export default {
  name: 'SourceOptions',

  components: {
    FolderBrowser,
    TaggerModal,
    TagChip,
  },

  emits: {
    showFolderBrowser: null,
    hideFolderBrowser: null,
    showTaggerModal: null,
    hideTaggerModal: null,
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
  }),

  computed: {
    NS () { return 'playerOptionsSource' },

    PLAYER_NS () { return 'player' },

    availableFilterFileTypes () {
      return this.$store.getters[`${this.NS}/${PLAYER_OPTS_SRC_G_AVAILABLE_FILE_TYPES}`];
    },

    tags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_SRC_G_TAGS}`] },
      set (tags) { this.$store.commit(`${this.NS}/${PLAYER_OPTS_SRC_M_SOURCE_OPTIONS}`, { tags }) },
    },

    tagsOperator () {
      return this.$store.getters[`${this.NS}/${PLAYER_OPTS_SRC_G_TAGS_OPERATOR}`];
    },

    tagsOperatorText () { return this.tagsOperator },

    filterFileTypes: {
      get () {
        return this.$store.getters[`${this.NS}/${PLAYER_OPTS_SRC_G_FILE_TYPES}`]
          .map((type) => this.availableFilterFileTypes.indexOf(type));
      },
      set (typesIndex) {
        const fileTypes = typesIndex.map((index) => this.availableFilterFileTypes[index]);
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_SRC_M_SOURCE_OPTIONS}`, { fileTypes });
      },
    },

    nbSelectedFolders () { return this.folderBrowser.selected.length },

    nbSelectedTags () { return this.taggerModal.selectedTagIds.length },

    fromPined: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_SRC_G_FROM_PINED}`] },
      set (fromPined) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_SRC_M_SOURCE_OPTIONS}`, { fromPined });
      },
    },

    pinedsLength () { return this.$store.getters[`${this.PLAYER_NS}/${PLAYER_G_PINEDS_LENGTH}`] },
  },

  watch: {},

  mounted () {},

  methods: {
    showFolderBrowser () {
      this.$emit('showFolderBrowser');
      this.folderBrowser.show = true;
    },

    onCloseFolderBrowser () {
      this.$emit('hideFolderBrowser');
      this.folderBrowser.show = false;
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
      this.$store.commit(`${this.NS}/${PLAYER_OPTS_SRC_M_SOURCE_OPTIONS}`, { folders });
    },

    showTaggerModal () {
      this.$emit('showTaggerModal');
      this.taggerModal.show = true;
    },

    onCloseTaggerModal () {
      this.taggerModal.show = false;
      this.$emit('hideTaggerModal');
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
      this.$store.commit(
        `${this.NS}/${PLAYER_OPTS_SRC_M_SOURCE_OPTIONS}`,
        { tags: [...selectedTagIds] },
      );
    },

    toggleTagsOperator () {
      this.$store.commit(`${this.NS}/${PLAYER_OPTS_SRC_M_TOGGLE_TAGS_OPERATOR}`);
    },

    clearPineds () {
      this.fromPined = false;
      this.$store.commit(`${this.PLAYER_NS}/${PLAYER_M_CLEAR_PINEDS}`);
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.source-options {
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

  .pineds-col {
    display: flex;
    align-items: center;
  }

  .clear-pineds-hide {
    opacity: 0;
  }

  .v-label {
    margin-right: 20px;
  }
}
</style>
