<template>
  <v-dialog
    content-class="tagger-modal"
    :value="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    persistent
    no-click-animation
  >
    <v-card>
      <v-toolbar dense>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Tagger</v-toolbar-title>
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
        ref="Tagger"
        :selected="selected"
        @select="onSelect"
        @unselect="onUnselect"
        @cancel="onCancel"
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

    selected: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    close: null,
    save: null,
  },

  data: () => ({
    selectedTagsIds: {},

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return Object.keys(this.selectedTagsIds).length },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },
  },

  watch: {
    show (onShow) { return onShow ? this.onShow() : this.onHide() },
  },

  mounted () {},

  methods: {
    onShow () {
      this.selectedTagsIds = Object.fromEntries(this.selected.map((tag) => [tag.id, true]));

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        this.$refs.Tagger.onShow();
      }, 300);
    },

    onHide () {
      this.$refs.Tagger.onHide();
    },

    onSave () {
      this.$emit(
        'save',
        Object.keys(this.selectedTagsIds).map((id) => this.tags[id]),
      );
      this.onClose();
    },

    onCancel () {
      this.onClose();
    },

    onClose () {
      this.onHide();
      this.$emit('close');
      this.selectedTagsIds = {};
    },

    onSelect (tagId) {
      this.$set(this.selectedTagsIds, tagId, true);
    },

    onUnselect (tagId) {
      this.$delete(this.selectedTagsIds, tagId);
    },

    onUnselectAll () { this.selectedTags = {} },

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
  .ctn {
    height: calc(100vh - $v-toolbar-height);
    overflow: auto;
    padding: 10px;
    padding-bottom: 40px;
  }

  .cancel-btn {
    text-transform: none;
    color: $grey-6;
    &:hover {
      color: white;
    }
  }
}
</style>
