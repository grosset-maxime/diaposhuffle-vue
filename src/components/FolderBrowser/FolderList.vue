<script>
import {
  FOLDER_BROWSER_A_FETCH_FOLDERS,
  FOLDER_BROWSER_G_FOLDERS,
} from '../../store/types';
import FolderCtn from './FolderCtn.vue';
import CircularLoading from '../CircularLoading.vue';

export default {
  name: 'FolderList',

  components: {
    FolderCtn,
    CircularLoading,
  },

  props: {
    selected: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    select: null,
    unselect: null,
  },

  data: () => ({}),

  render (createElement) {
    const buildFolder = (folder, level) => createElement('FolderCtn', {
      props: {
        folder,
        selected: this.selected.includes(folder.path),
      },
      on: {
        expand: (path) => { this.fetchFolder(path) },
        select: (path) => { this.$emit('select', path) },
        unselect: (path) => { this.$emit('unselect', path) },
      },
      slot: 'sub-folders',
    }, folder.children.map((f) => buildFolder(f, level + 1)));

    const isRootHasFolders = (this.folders.children || []).length;
    const isRootFetched = this.folders.fetched;

    let elements = [];

    if (!isRootFetched) {
      elements = [createElement('CircularLoading')];
    } else if (!isRootHasFolders) {
      elements = [createElement('div', { class: 'no-folders' }, 'No Folders')];
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
    onShow () { this.fetchFolder() },

    fetchFolder (path) {
      this.$store.dispatch(`${this.NS}/${FOLDER_BROWSER_A_FETCH_FOLDERS}`, path);
    },
  },

  beforeDestroy () {},
};
</script>

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
