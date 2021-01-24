<script>

export default {
  name: 'FoldersBrowserList',

  props: {
    folders: {
      type: Object,
      default: () => {},
    },
  },

  emits: {
  },

  data: () => ({
  }),

  render (createElement) {
    const that = this;
    const buildFolder = (folder, level) => {
      const hasNoSubFolders = folder.hasFetchedChildren && !folder.children.length;
      const { name, path } = folder;

      const subFolderCtn = createElement( // Sub folders container.
        'div', { class: 'sub-folders-ctn hide' },
        folder.children.map((f) => buildFolder(f, level + 1)),
      );

      return createElement('div', { class: 'folder-ctn' }, [
        createElement('div', { class: 'folder' }, [
          createElement('v-btn', {
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
                  subFolderCtn.elm.classList.toggle('hide');
                  that.$emit('fetch', path);
                }
              },
            },
          }, [
            createElement('v-icon', {
              class: 'plus-icon',
            }, 'mdi-plus'),
            createElement('v-icon', {
              class: 'minus-icon',
            }, 'mdi-minus'),
          ]),
          createElement('v-checkbox', {
            class: '',
            attrs: {},
          }),
          createElement('div', { class: 'name' }, name),
        ]),
        subFolderCtn,
      ]);
    };

    return createElement(
      'div',
      { class: 'folders-browser-list' },
      this.folders.children
        ? this.folders.children.map((folder) => buildFolder(folder, 0))
        : [createElement('div', { class: 'no-folders' }, 'No Folders')],
      this.$slots.default,
    );
  },

  computed: {
    NS () { return 'foldersBrowser' },
  },

  watch: {},

  mounted () {},

  methods: {},

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">
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
    display: flex;
    align-items: center;
    height: 40px;
  }

  .sub-folders-ctn {
    padding-left: 12px;
    margin-left: 12px;
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
