<script>
import {
  FOLDERS_BROWSER_A_FETCH_FOLDERS,
  FOLDERS_BROWSER_G_FOLDERS,
} from '../store/types';

export default {
  name: 'FoldersBrowserList',

  props: {
    selected: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({}),

  render (createElement) {
    const that = this;
    const buildFolder = (folder, level) => {
      const hasNoSubFolders = folder.hasFetchedChildren && !folder.children.length;
      const { name, path } = folder;

      const subFoldersCtn = createElement( // Sub folders container.
        'div', { class: 'sub-folders-ctn hide' },
        folder.children.map((f) => buildFolder(f, level + 1)),
      );

      const checkbox = createElement('v-checkbox', {
        class: 'select-checkbox',
        props: {
          label: name,
          'true-value': true,
          'false-value': false,
          'input-value': that.selected.includes(folder.path),
        },
        on: {
          change (isChecked) {
            that.$emit(isChecked ? 'onSelect' : 'onUnselect', folder.path);
          },
        },
      });

      return createElement('div', { class: 'folder-ctn' }, [
        createElement('div', { class: 'folder' }, [
          createElement('v-btn', { // Expand btn
            class: `expand-btn ${hasNoSubFolders ? 'no-sub-folders' : ''}`,
            props: {
              width: 24,
              'min-width': 24,
              height: 24,
              color: 'orange',
              disabled: hasNoSubFolders,
            },
            on: {
              click (e) {
                if (!hasNoSubFolders) {
                  e.currentTarget.classList.toggle('expanded');
                  subFoldersCtn.elm.classList.toggle('hide');
                  that.fetchFolders(path);
                }
              },
            },
          }, [
            createElement('v-icon', { class: 'plus-icon' }, 'mdi-plus'),
            createElement('v-icon', { class: 'minus-icon' }, 'mdi-minus'),
          ]),
          checkbox,
        ]),
        subFoldersCtn,
      ]);
    };

    const hasFolders = (that.folders.children || []).length;

    return createElement(
      'div',
      { class: 'folders-browser-list' },
      hasFolders
        ? that.folders.children.map((folder) => buildFolder(folder, 0))
        : [createElement('div', { class: 'no-folders' }, 'No Folders')],
      that.$slots.default,
    );
  },

  computed: {
    NS () { return 'foldersBrowser' },

    folders () { return this.$store.getters[`${this.NS}/${FOLDERS_BROWSER_G_FOLDERS}`] },
  },

  watch: {},

  mounted () {},

  methods: {
    onShow () { this.fetchFolders() },

    fetchFolders (path) {
      this.$store.dispatch(`${this.NS}/${FOLDERS_BROWSER_A_FETCH_FOLDERS}`, path);
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">
$folder-padding-left: 5px;

.folders-browser-list {
  height: 100%;

  .v-btn.expand-btn {
    padding: 0 12px;
  }

  .expand-btn {
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

  .no-folders {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
  }
}
</style>
