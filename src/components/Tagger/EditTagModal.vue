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
      Delete this tag?
    </DeleteModal>
  </v-dialog>
</template>

<script>
import { TAGGER_G_CATEGORIES_LIST, TAGGER_G_TAGS_LIST } from '../../store/types';
import { deepClone, getKey } from '../../utils/utils';
import DeleteModal from '../DeleteModal.vue';
import CircularLoading from '../CircularLoading.vue';

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
      category: '',
    },

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

    tags () {
      return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS_LIST}`];
    },

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

    tag (tag) {
      this.setModel(tag);
    },

    modelName (name) {
      this.nameWarningMsg = (name || '').trim() && this.isNameExists(name)
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

    if (this.tag && this.tag.id) {
      this.setModel(this.tag);
    }
  },

  methods: {
    getCategoryColor (category) {
      return `#${category.color}`;
    },

    setModel (tag) {
      if (!tag || !tag.id) {
        this.resetForm();
        return;
      }

      this.model = deepClone(tag);
    },

    resetForm () {
      this.model = {
        id: '',
        name: '',
        category: '',
      };

      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    resetFormValidation () {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    isIdNotExists (value) {
      return !value
        || !this.add
        || !this.tags.some(
          (tag) => tag.id.toLowerCase() === value.trim().toLowerCase(),
        )
        || 'Id already exists.';
    },

    isNameExists (value) {
      return this.tags.some(
        (tag) => tag.name.toLowerCase() === (value || '').trim().toLowerCase()
          && tag.id !== this.model.id,
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
      this.$emit('delete', this.tag.id);
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
        switch (key) {
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
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #{$grey-8 + '80'};
    z-index: 100;
  }
}
</style>
