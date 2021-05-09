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
          :disabled="!isFormValid"
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
  name: 'EditCategoryModal',

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

    isFormValid: false,

    nameWarningMsg: '',

    rules: {
      required: (value) => !!value || 'Required.',
    },

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

        if (this.add) { this.resetForm() }
      } else {
        this.removeKeyboardShortcuts();
        this.resetForm();
      }
    },

    category (category) {
      this.setModel(category);
    },

    color (value) {
      // temporary fix while there is no way to disable the alpha channel in the
      // colorpicker component: https://github.com/vuetifyjs/vuetify/issues/9590
      if (value.toString().match(/#[a-zA-Z0-9]{8}/)) {
        this.color = value.substr(0, 7);
      }

      // TODO: test if the color already set to another category and then display a warning message.
      this.$set(this.model, 'color', this.color);
    },

    modelName (name) {
      this.nameWarningMsg = (name || '').trim() && this.isNameExists(name)
        ? 'Name already exists.'
        : '';
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

    isNameExists (value) {
      return this.categories.some(
        (cat) => cat.name.toLowerCase() === (value || '').trim().toLowerCase(),
      );
    },

    updateModel (key, value) {
      this.$set(this.model, key, value);
    },

    onConfirm () {
      const isFormValid = this.$refs.form.validate();

      if (isFormValid) {
        this.$emit('confirm', { ...this.model });
      }
    },

    onCancel () { this.$emit('cancel') },

    // TODO: on delete show confirm modal before emiting delete.
    onDelete () { this.$emit('delete', this.category.id) },

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
  // position: absolute;
  // top: 0;
  // display: flex;
  // align-items: center;
  // background: $grey-7#{AA};
  // padding: 15px;
  // width: 400px;

  .modal-body {
    height: calc(100vh - 200px);
    overflow: auto;

    // .color-picker {
    // }
  }

  .modal-btn {
    // width: 100px;
    // margin-left: 20px;
  }
}
</style>
