<script>
import {
  FOLDER_BROWSER_A_FETCH_FOLDERS,
  FOLDER_BROWSER_G_FOLDERS,
} from '../../store/types';

export default {
  name: 'FolderList',

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
      const hasNoSubFolders = folder.fetched && !folder.children.length;
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
          'input-value': this.selected.includes(folder.path),
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

    // TODO: Show loading on fetch a folder.

    const isRootHasFolders = (this.folders.children || []).length;
    const isRootFetched = this.folders.fetched;

    let elements = [];

    if (!isRootFetched) {
      elements = [createElement('div', {
        class: 'loading-first-fetch',
      }, [
        createElement('v-progress-circular', {
          props: {
            size: 100,
            width: 10,
            indeterminate: true,
            color: 'orange',
          },
        }),
      ])];
    } else if (!isRootHasFolders) {
      elements = [createElement('div', { class: 'no-folders' }, 'No Folders'),
      ];
    } else {
      elements = this.folders.children.map((folder) => buildFolder(folder, 0));
    }

    return createElement(
      'div',
      { class: 'folder-list' },
      elements,
      this.$slots.default,
    );
  },

  computed: {
    NS () { return 'folderBrowser' },

    folders () { return this.$store.getters[`${this.NS}/${FOLDER_BROWSER_G_FOLDERS}`] },
  },

  watch: {},

  mounted () {},

  methods: {
    onShow () { this.fetchFolders() },

    fetchFolders (path) {
      this.$store.dispatch(`${this.NS}/${FOLDER_BROWSER_A_FETCH_FOLDERS}`, path);
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
</style>

<style lang="scss" scoped>
$folder-padding-left: 5px;

.folder-list {
  height: 100%;

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

  .no-folders,
  .loading-first-fetch {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
  }
}
</style>
