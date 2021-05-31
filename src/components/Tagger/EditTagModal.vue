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
          <v-form
            v-model="isFormValid"
            ref="form"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :value="model.id"
                  :disabled="!add"
                  :autofocus="add"
                  :rules="[rules.required, isIdNotExists]"
                  label="Id"
                  required
                  @input="updateModel('id', $event)"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  :value="model.name"
                  :autofocus="!add"
                  :rules="[rules.required]"
                  :hint="nameWarningMsg"
                  label="Name"
                  required
                  @input="updateModel('name', $event)"
                />
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  :value="model.category"
                  :items="categories"
                  item-text="name"
                  item-value="id"
                  label="Category"
                  chips
                  deletable-chips
                  hide-selected
                  @input="updateModel('category', $event)"
                >
                  <template v-slot:selection="data">
                    <v-chip
                      v-bind="data.attrs"
                      :color="getCategoryColor(data.item)"
                      text-color="white"
                      close
                      outlined
                      @click:close="updateModel('category', '')"
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
          </v-form>
        </v-container>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="!add"
          class="modal-btn"
          tabindex="-1"
          @click="onDeleteBtnClick"
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
          :disabled="!isFormValid"
          tabindex="0"
          @click="onConfirm"
        >
          {{ confirmBtnText }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <CircularLoading
      class="loading"
      v-if="loading"
      indeterminate
    />

    <DeleteModal
      v-if="!add"
      :show="showDeleteModal"
      @confirm="closeConfirmDelete({ deleteTag: true })"
      @cancel="closeConfirmDelete"
      @click:outside="closeConfirmDelete"
    >
      <template v-slot:message>
        Delete this tag?
      </template>
    </DeleteModal>
  </v-dialog>
</template>

<script>
import {
  TAGGER_G_CATEGORIES_LIST, TAGGER_G_TAGS, TAGGER_G_TAGS_LIST,
} from '../../store/types';
import { deepClone, getKey } from '../../utils/utils';
import DeleteModal from '../DeleteModal.vue';
import CircularLoading from '../CircularLoading.vue';

const EMPTY_MODEL = {
  id: '',
  name: '',
  category: '',
};

export default {
  name: 'EditTagModal',

  components: {
    DeleteModal,
    CircularLoading,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    tagId: {
      type: String,
      default: '',
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
    model: { ...EMPTY_MODEL },

    nameWarningMsg: '',

    rules: {
      required: (value) => !!value || 'Required.',
    },

    isFormValid: false,

    showDeleteModal: false,

    loading: false,

    keyboardShortcuts: () => {},
  }),

  computed: {
    NS () { return 'tagger' },

    titleModal () {
      return this.add ? 'Add new tag' : 'Edit tag';
    },

    confirmBtnText () { return this.add ? 'Add' : 'Edit' },

    categories () {
      return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES_LIST}`];
    },

    tagsMap () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    tagsList () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS_LIST}`] },

    modelName () { return this.model.name },
  },

  watch: {
    show (isShow) {
      if (isShow) {
        this.loading = false;

        this.attachKeyboardShortcuts();

        if (this.add) {
          this.resetForm();
        } else {
          this.resetFormValidation();
        }
      } else {
        this.removeKeyboardShortcuts();
      }
    },

    tagId (tagId) { this.setModel(tagId) },

    modelName (name) {
      this.nameWarningMsg = name?.trim() && this.isNameExists(name)
        ? 'Name already exists.'
        : '';
    },

    showDeleteModal (shouldShow) {
      if (shouldShow) {
        this.removeKeyboardShortcuts();
      } else {
        this.attachKeyboardShortcuts();
      }
    },
  },

  mounted () {
    this.loading = false;
    this.setModel(this.tagId);
  },

  methods: {
    getCategoryColor (category) {
      return `#${category.color}`;
    },

    setModel (tagId) {
      if (!tagId) {
        this.resetForm();
        return;
      }

      this.model = deepClone(this.tagsMap[tagId]);
    },

    resetForm () {
      this.model = { ...EMPTY_MODEL };
      // eslint-disable-next-line no-unused-expressions
      this.$refs.form?.reset();
    },

    resetFormValidation () {
      // eslint-disable-next-line no-unused-expressions
      this.$refs.form?.resetValidation();
    },

    isIdNotExists (value) {
      return !value
        || !this.add
        || !this.tagsList.some(
          (tag) => tag.id.toLowerCase() === value.trim().toLowerCase(),
        )
        || 'Id already exists.';
    },

    isNameExists (value) {
      return this.tagsList.some(
        (tag) => tag.id !== this.model.id
          && tag.name.toLowerCase() === value?.trim().toLowerCase(),
      );
    },

    updateModel (key, value) { this.$set(this.model, key, value) },

    onConfirm () {
      const isFormValid = this.$refs.form.validate();

      if (isFormValid) {
        this.loading = true;
        this.$emit('confirm', { ...this.model });
      }
    },

    onCancel () { this.$emit('cancel') },

    onDelete () {
      this.loading = true;
      this.$emit('delete', this.tagId);
      this.onCancel();
    },

    onDeleteBtnClick () { this.showDeleteModal = true },

    closeConfirmDelete ({ deleteTag } = {}) {
      this.showDeleteModal = false;

      if (deleteTag) { this.onDelete() }
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts = (e) => {
        const key = getKey(e);
        let preventDefault = false;
        const stopPropagation = false;

        if (e.altKey) {
          switch (key) {
            // On windows, Meta + Enter does not trigger a keydown event,
            // So, set Alt + Enter to validate.
            case 'Enter':
              this.onConfirm();
              preventDefault = true;
              break;

            default:
          }
        } else if (e.metaKey) {
          // On windows, Alt + Escape does not trigger a keydown event,
          // So, set Meta + Escape to cancel.
          switch (key) {
            case 'Escape':
              this.onCancel();
              preventDefault = true;
              break;

            default:
          }
        }

        if (preventDefault) { e.preventDefault() }
        if (stopPropagation) { e.stopPropagation() }
      };

      window.addEventListener('keydown', this.keyboardShortcuts);
    },

    removeKeyboardShortcuts () {
      window.removeEventListener('keydown', this.keyboardShortcuts);
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
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #{$grey-8 + '80'};
    z-index: 100;
  }
}
</style>
