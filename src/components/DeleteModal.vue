<template>
  <v-dialog
    content-class="delete-modal"
    :value="show"
    persistent
    no-click-animation
    @click:outside="$emit('click:outside')"
  >
    <div class="delete-modal-body">
      <div class="message">
        <!-- @slot Default slot to display delete confirm message -->
        <slot>Delete this item?</slot>
      </div>

      <div
        class="options"
        v-if="showOptions"
      >
        <v-checkbox
          class="option-only-from-bdd option mt-2 mb-2"
          v-model="options.fromBddOnly"
          label="Only from Bdd"
          hide-details
        />
        <v-checkbox
          class="option-ignore-if-exist option mt-2 mb-2"
          v-model="options.ignoreIfNotExist"
          label="Ignore if not exist"
          hide-details
        />
      </div>
    </div>

    <v-divider class="separator" />

    <div class="modal-btns">
      <v-btn
        class="modal-btn"
        @click="onCancel"
      >
        Cancel
      </v-btn>

      <v-btn
        class="modal-btn primary"
        @click="onConfirm"
      >
        Delete
      </v-btn>
    </div>
  </v-dialog>
</template>

<script>
// TODO: Feature: Propound a slot to display a preview of the item to delete.
import { getKey } from '../utils/utils';

const DEFAULT_OPTIONS = {
  fromBddOnly: false,
  ignoreIfNotExist: false,
};

export default {
  name: 'DeleteModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    showOptions: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    confirm: null,
    cancel: null,
    'click:outside': null,
  },

  data: () => ({
    options: { ...DEFAULT_OPTIONS },

    keyboardShortcuts: () => {},
  }),

  computed: {},

  watch: {
    show (isShow) {
      if (isShow) {
        this.attachKeyboardShortcuts();
        this.resetOptions();
      } else {
        this.removeKeyboardShortcuts();
      }
    },
  },

  methods: {
    onConfirm () { this.$emit('confirm', { ...this.options }) },

    onCancel () { this.$emit('cancel') },

    resetOptions () { this.options = { ...DEFAULT_OPTIONS } },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts = (e) => {
        const key = getKey(e);

        switch (key) {
          case 'Enter':
            this.onConfirm();
            break;

          case 'Escape':
            this.onCancel();
            break;
          default:
        }
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

.delete-modal {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $grey-7#{CC};
  padding: 15px;
  width: 600px;

  .separator {
    margin: 4px 0;
  }

  .delete-modal-body {
    min-height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .options {
      display: flex;

      .option {
        margin-right: 30px;
      }
    }
  }

  .modal-btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 8px;

    .modal-btn {
      width: 100px;
      margin-left: 20px;
    }
  }
}
</style>
