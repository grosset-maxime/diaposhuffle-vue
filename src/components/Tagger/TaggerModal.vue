<template>
  <v-dialog
    :content-class="modalClasses"
    :value="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    persistent
    no-click-animation
  >
    <v-card style="height:100%">
      <v-toolbar
        class="tagger-modal-toolbar"
        dense
      >
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-toolbar-title>Tagger</v-toolbar-title>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="edit-btn ml-3"
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="editMode = !editMode"
            >
              <v-icon
                class="edit-icon"
                dense
              >
                mdi-pencil
              </v-icon>
            </v-btn>
          </template>
          <span>Edit Mode</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="select-random-btn ml-3"
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click="$refs.Tagger.selectRandom()"
            >
              <v-icon
                class="select-random-icon"
                dense
              >
                mdi-shuffle-variant
              </v-icon>
            </v-btn>
          </template>
          <span>Select Random</span>
        </v-tooltip>

        <v-spacer />

        <v-toolbar-items>
          <v-btn
            class="cancel-btn"
            text
            @click="onCancel"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="onSave"
          >
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <Tagger
        class="tagger-ctn"
        ref="Tagger"
        :selected="selectedTagIds"
        :edit-mode="editMode"
        @select="onSelect"
        @unselect="onUnselect"
        @cancel="onCancel"
        @save="onSave"
        @toggleOpacity="onToggleOpacity"
        @mounted="onTaggerMounted"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import {
  TAGGER_A_FETCH_TAGS,
  TAGGER_G_TAGS,
} from '../../store/types';
import Tagger from './Tagger.vue';

export default {
  name: 'TaggerModal',

  components: {
    Tagger,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    selectedTagIds: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    close: null,
    save: null,
  },

  data: () => ({
    selectedTagsIdsMap: {},

    editMode: false,

    hasOpacity: false,

    isTaggerMounted: false,

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'tagger' },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    modalClasses () {
      return `tagger-modal ${this.hasOpacity ? 'has-opacity' : ''}`;
    },
  },

  watch: {
    show (onShow) { return onShow ? this.onShow() : this.onHide() },
  },

  mounted () {},

  methods: {
    onShow () {
      this.editMode = false;
      this.hasOpacity = false;

      this.selectedTagsIdsMap = Object.fromEntries(
        this.selectedTagIds.map((tagId) => [tagId, true]),
      );

      if (this.isTaggerMounted) {
        this.$refs.Tagger.onShow();
      }
    },

    onHide () {
      this.$refs.Tagger.onHide();
    },

    onSave () {
      this.$emit(
        'save',
        Object.keys(this.selectedTagsIdsMap),
      );
      this.onClose();
    },

    onCancel () {
      this.onClose();
    },

    onClose () {
      this.onHide();
      this.$emit('close');
      this.selectedTagsIdsMap = undefined;
    },

    onSelect (tagId) {
      this.$set(this.selectedTagsIdsMap, tagId, true);
    },

    onUnselect (tagId) {
      this.$delete(this.selectedTagsIdsMap, tagId);
    },

    onUnselectAll () { this.selectedTags = {} },

    onToggleOpacity () { this.hasOpacity = !this.hasOpacity },

    onTaggerMounted () {
      this.$refs.Tagger.onShow();
      this.isTaggerMounted = true;
    },

    fetchTags () {
      this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_TAGS}`);
    },
  },
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
$v-toolbar-height: 48px;

.tagger-modal {
  overflow-x: hidden;
  overflow-y: hidden;

  &.has-opacity {
    opacity: 0.3;
  }

  .tagger-ctn {
    height: calc(100% - #{$v-toolbar-height});
  }

  .tagger-modal-toolbar {
    .cancel-btn,
    .edit-btn,
    .select-random-btn {
      text-transform: none;
      color: $grey-6;
      &:hover {
        color: white;
      }
    }

    .edit-btn .edit-icon {
      font-size: 18px;
    }
  }
}
</style>
