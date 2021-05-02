<template>
  <v-dialog
    content-class="delete-modal"
    :value="show"
  >
    <div>{{ message }}</div>

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
  </v-dialog>
</template>

<script>
import { getKey } from '../utils/utils';

export default {
  name: 'DeleteModal',

  props: {
    show: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
      default: 'Delete this item ?',
    },
  },

  emits: {
    confirm: null,
    cancel: null,
  },

  data: () => ({
    keyboardShortcuts: () => {},
  }),

  computed: {},

  watch: {
    show (isShow) {
      if (isShow) {
        this.attachKeyboardShortcuts();
      } else {
        this.removeKeyboardShortcuts();
      }
    },
  },

  methods: {
    onConfirm () { this.$emit('confirm') },

    onCancel () { this.$emit('cancel') },

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

.delete-modal {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  background: $grey-7#{AA};
  padding: 15px;
  width: 400px;

  .modal-btn {
    width: 100px;
    margin-left: 20px;
  }
}
</style>
