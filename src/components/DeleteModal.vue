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
        <div
          v-if="showPreview"
          class="preview-slot-ctn"
        >
          <!-- @slot preview of the item. -->
          <slot name="preview" />
        </div>

        <div class="message-slot-ctn">
          <!-- @slot slot to display delete confirm message. -->
          <slot name="message">
            Delete this item?
          </slot>
        </div>
      </div>

      <div
        v-if="showSrc"
        class="src-slot-ctn"
      >
        <!-- @slot Src of the item. -->
        <slot name="src" />
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

    showPreview: {
      type: Boolean,
      default: false,
    },

    showSrc: {
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

    .message {
      display: flex;
      align-items: center;

      .preview-slot-ctn {
        margin-right: 20px;
        height: 100px;
        width: 100px;
        overflow: hidden;

        .preview {
          object-fit: contain;
          width: 100%;
          height: 100%;
        }
      }
    }

    .src-slot-ctn {
      margin-top: 5px;
      margin-bottom: 5px;
    }

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
