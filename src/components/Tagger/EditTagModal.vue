<template>
  <v-dialog
    content-class="edit-tag-modal"
    :value="show"
    persistent
    no-click-animation
  >
    <v-card outlined>
      <v-card-title
        class="orange--text"
      >
        {{ titleModal }}
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col
              cols="12"
            >
              <!-- TODO: check if not empty with rules and required. -->
              <v-text-field
                v-model="model.id"
                :disabled="!add"
                :autofocus="add"
                label="Id"
                required
              />
            </v-col>
            <v-col cols="12">
              <!-- TODO: check if not empty with rules and required. -->
              <v-text-field
                v-model="model.name"
                :autofocus="!add"
                label="Name"
                required
              />
            </v-col>
            <v-col
              cols="12"
            >
              <v-autocomplete
                v-model="model.category"
                :items="categories"
                item-text="name"
                item-value="id"
                label="Category"
                chips
                deletable-chips
                hide-selected
              >
                <template v-slot:selection="data">
                  <v-chip
                    v-bind="data.attrs"
                    :color="getCategoryColor(data.item)"
                    text-color="white"
                    close
                    outlined
                    @click:close="model.category = 0"
                  >
                    <v-avatar
                      left
                      :color="getCategoryColor(data.item)"
                    />
                    {{ data.item.name }}
                  </v-chip>
                </template>

                <template v-slot:item="data">
                  <v-list-item-avatar
                    :color="getCategoryColor(data.item)"
                    size="30"
                  />
                  <v-list-item-content>
                    <v-list-item-title v-html="data.item.name" />
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="!add"
          class="modal-btn"
          tabindex="-1"
          @click="onDelete"
        >
          Delete
        </v-btn>

        <v-btn
          class="modal-btn"
          tabindex="-1"
          @click="onCancel"
        >
          Cancel
        </v-btn>

        <v-btn
          class="modal-btn primary"
          tabindex="0"
          @click="onConfirm"
        >
          {{ confirmBtnText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { TAGGER_G_CATEGORIES_LIST } from '../../store/types';
import { deepClone, getKey } from '../../utils/utils';

export default {
  name: 'EditTagModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    tag: {
      type: Object,
      default: () => ({}),
    },

    add: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    confirm: null,
    cancel: null,
    delete: null,
  },

  data: () => ({
    model: {
      id: '',
      name: '',
      category: 0,
    },

    keyboardShortcuts: () => {},
  }),

  computed: {
    NS () { return 'tagger' },

    titleModal () {
      return this.add ? 'Add new tag' : 'Edit tag';
    },

    confirmBtnText () {
      return this.add ? 'Add' : 'Edit';
    },

    categories () {
      return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES_LIST}`];
    },
  },

  watch: {
    show (isShow) {
      if (isShow) {
        this.attachKeyboardShortcuts();
      } else {
        this.removeKeyboardShortcuts();
      }
    },

    tag (tag) {
      this.setModel(tag);
    },
  },

  mounted () {
    if (this.tag && this.tag.id) {
      this.setModel(this.tag);
    }
  },

  methods: {
    getCategoryColor (category) {
      return `#${category.color}`;
    },

    setModel (tag) {
      if (tag) { this.model = deepClone(tag) }
    },

    onConfirm () { this.$emit('confirm', this.model) },

    onCancel () { this.$emit('cancel') },

    onDelete () { this.$emit('delete', this.tag.id) },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts = (e) => {
        const key = getKey(e);
        switch (key) {
          case 'Enter':
            // TODO: to confirm, user has to click to the confirm btn or focus to it and enter.
            // TODO: do not confirm if id or/and name is empty.
            // this.onConfirm();
            break;

          case 'Escape':
            this.onCancel();
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts);
    },

    removeKeyboardShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts);
    },
  },

  beforeDestroy () {
    this.removeKeyboardShortcuts();
  },
};
</script>

<style lang="scss">
/* FYI: As Vuetify v-dialog is injected at root in DOM, style cannot be scoped. */

.edit-tag-modal {
  // position: absolute;
  // top: 0;
  // display: flex;
  // align-items: center;
  // background: $grey-7#{AA};
  // padding: 15px;
  // width: 400px;

  .modal-btn {
    // width: 100px;
    // margin-left: 20px;
  }
}
</style>
