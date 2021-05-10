<template>
  <v-dialog
    content-class="edit-category-modal"
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

      <v-card-text class="modal-body">
        <v-container>
          <v-form
            v-model="isFormValid"
            ref="form"
          >
            <v-row>
              <v-col
                v-if="!add"
                class="pt-0"
                cols="12"
              >
                <v-text-field
                  :value="model.id"
                  label="Id"
                  hide-details
                  disabled
                />
              </v-col>

              <v-col
                class="pt-0"
                cols="12"
              >
                <v-text-field
                  :value="model.name"
                  autofocus
                  :rules="[rules.required]"
                  :hint="nameWarningMsg"
                  label="Name"
                  required
                  @input="updateModel('name', $event)"
                />
              </v-col>

              <v-col
                class="pt-0"
                cols="12"
              >
                <v-alert
                  v-if="colorWarningMsg"
                  class="color-warning-alert"
                  type="warning"
                  icon="mdi-alert"
                  dense
                >
                  {{ colorWarningMsg }}
                </v-alert>

                <v-color-picker
                  v-model="color"
                  class="color-picker"
                  dot-size="25"
                  swatches-max-height="100%"
                  mode="hexa"
                  show-swatches
                  width="100%"
                  hide-canvas
                />
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

    <DeleteModal
      v-if="!add"
      :show="showDeleteModal"
      @confirm="closeConfirmDelete({ deleteCat: true })"
      @cancel="closeConfirmDelete"
      @click:outside="closeConfirmDelete"
    >
      Delete this category?
    </DeleteModal>
  </v-dialog>
</template>

<script>
import { TAGGER_G_CATEGORIES_LIST } from '../../store/types';
import { deepClone, getKey } from '../../utils/utils';
import DeleteModal from '../DeleteModal.vue';

export default {
  name: 'EditCategoryModal',

  components: {
    DeleteModal,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    category: {
      type: Object,
      default: () => ({
        id: 0,
        name: '',
        color: '',
      }),
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
      id: 0,
      name: '',
      color: '',
    },

    color: '',

    nameWarningMsg: '',
    colorWarningMsg: '',

    rules: {
      required: (value) => !!value || 'Required.',
    },

    isFormValid: false,

    showDeleteModal: false,

    keyboardShortcuts: () => {},
  }),

  computed: {
    NS () { return 'tagger' },

    titleModal () {
      return this.add ? 'Add new category' : 'Edit category';
    },

    confirmBtnText () {
      return this.add ? 'Add' : 'Edit';
    },

    categories () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORIES_LIST}`
      ];
    },

    modelName () { return this.model.name },
  },

  watch: {
    show (isShow) {
      if (isShow) {
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

    category (category) {
      this.setModel(category);
    },

    color (value) {
      if (!value) { return }

      // temporary fix while there is no way to disable the alpha channel in the
      // colorpicker component: https://github.com/vuetifyjs/vuetify/issues/9590
      if (value.toString().match(/#[a-zA-Z0-9]{8}/)) {
        this.color = value.substr(0, 7);
      }

      if (this.color.includes(this.model.color)) { return }

      this.$set(this.model, 'color', this.color);

      const isColorAlreadyAssigned = this.categories.some(
        (cat) => this.color.toLowerCase().includes(cat.color.toLowerCase())
          && cat.id !== this.model.id,
      );

      this.colorWarningMsg = isColorAlreadyAssigned
        ? 'Color already assinged.'
        : '';
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
    if (this.category && this.category.id) {
      this.setModel(this.category);
    }
  },

  methods: {
    setModel (category) {
      if (!category || !category.id) {
        this.resetForm();
        return;
      }

      this.model = deepClone(category);
      this.color = `#${this.model.color}`;
    },

    resetForm () {
      this.model = {
        id: 0,
        name: '',
        color: '',
      };
      this.color = '';

      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },

    resetFormValidation () {
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    isNameExists (value) {
      return this.categories.some(
        (cat) => cat.name.toLowerCase() === (value || '').trim().toLowerCase()
          && cat.id !== this.model.id,
      );
    },

    updateModel (key, value) { this.$set(this.model, key, value) },

    onConfirm () {
      const isFormValid = this.$refs.form.validate();

      if (isFormValid) {
        this.$emit('confirm', { ...this.model });
      }
    },

    onCancel () { this.$emit('cancel') },

    onDelete () {
      this.$emit('delete', this.category.id);
      this.onCancel();
    },

    onDeleteBtnClick () { this.showDeleteModal = true },

    closeConfirmDelete ({ deleteCat } = {}) {
      this.showDeleteModal = false;

      if (deleteCat) { this.onDelete() }
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

.edit-category-modal {
  .modal-body {
    height: calc(100vh - 200px);
    overflow: auto;

    .color-warning-alert {
      margin-bottom: -10px;
      z-index: 1;
    }
  }
}
</style>
