<template>
  <div class="folder-ctn">
    <div
      class="folder"
      @click="onFolderLineClick"
    >
      <v-btn
        :class="['expand-btn', {
          'no-sub-folders': hasNoSubFolders,
          expanded: states.isExpanded
        }]"
        width="24"
        min-width="24"
        height="24"
        color="orange"
        :disabled="hasNoSubFolders"
        @click="onExpandBtnClick"
      >
        <v-progress-circular
          v-if="folder.fetching"
          size="15"
          width="1"
          indeterminate
        />
        <v-icon
          class="plus-icon"
          v-show="!folder.fetching"
        >
          mdi-plus
        </v-icon>
        <v-icon
          class="minus-icon"
          v-show="!folder.fetching"
        >
          mdi-minus
        </v-icon>
      </v-btn>

      <v-checkbox
        :label="folder.name"
        :true-value="true"
        :false-value="false"
        :input-value="selected"
        @change="onSelectedChange"
      />
    </div>
    <div
      :class="['sub-folders-ctn', {
        hide: !states.isExpanded
      }]"
    >
      <slot name="sub-folders" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderCtn',

  props: {
    folder: {
      type: Object,
      default: () => ({}),
    },

    selected: {
      type: Boolean,
      default: () => false,
    },
  },

  emits: {
    onExpand: null,
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({
    states: {
      isExpanded: false,
      isSelected: false,
    },
  }),

  computed: {
    NS () { return 'folderBrowser' },

    hasNoSubFolders () {
      return this.folder.fetched && !this.folder.children.length;
    },
  },

  mounted () {},

  methods: {
    onExpandBtnClick () {
      if (!this.hasNoSubFolders) {
        this.states.isExpanded = !this.states.isExpanded;
        this.$emit('onExpand', this.folder.path);
      }
    },

    onSelectedChange (isSelected) {
      this.$emit(isSelected ? 'onSelect' : 'onUnselect', this.folder.path);
    },

    onFolderLineClick (e) {
      if (e.target === e.currentTarget) {
        this.onSelectedChange(!this.selected);
      }
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
$folder-padding-left: 5px;

.folder-ctn {
  cursor: pointer;

  .expand-btn {
    padding: 0 12px;
    margin-right: 10px;

    &.expanded {
      .plus-icon {
        display: none;
      }
      .minus-icon {
        display: block;
      }
    }

    &.no-sub-folders {
      .plus-icon,
      .minus-icon {
        display: none;
      }
    }

    .plus-icon {
      display: block;
    }
    .minus-icon {
      display: none;
    }
  }

  .folder {
    padding-left: $folder-padding-left;
    display: flex;
    align-items: center;
    height: 40px;

    &:hover {
      background-color: $grey-7;
    }

    .name {
      cursor: pointer;
    }
  }

  .sub-folders-ctn {
    padding-left: 12px;
    margin-left: #{12px + $folder-padding-left};
    border-left: 1px dashed $grey-6;

    &.hide {
      display: none;
    }
  }
}
</style>
