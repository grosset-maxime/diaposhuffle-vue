<template>
  <div
    class="items-player"
    @click="onClick"
  >
    <div
      v-for="(item, i) in getItems()"
      :key="getItemName(i)"
      :ref="getItemName(i)"
      :class="['item-ctn', getItemName(i), {
        transition: switchWithTransition
      }]"
      :style="item.styles"
    >
      <img
        v-if="item.src && (item.data || {}).isImage"
        :src="item.src"
        class="item img"
        draggable="false"
        @load="onItemLoaded(getItemName(i))"
        @error="onItemError(getItemName(i), $event)"
      >
      <video
        v-if="item.src && (item.data || {}).isVideo"
        :src="item.src"
        class="item vid"
        :autoplay="item.videoOptions.autoplay"
        :loop="item.videoOptions.loop"
        :muted="muteVideo"
        :controls="item.videoOptions.controls"
        :controlsList="item.videoOptions.controlsList"
        disablePictureInPicture
        @canplay="onItemLoaded(getItemName(i))"
        @pause="onPauseVideo()"
        @play="onPlayVideo()"
        @error="onItemError(getItemName(i), $event)"
      />
    </div>
  </div>
</template>

<script>
import { deepClone } from '../utils/utils';

const ITEM_1_NAME = 'item1';
const ITEM_2_NAME = 'item2';

const defaultVideoOptions = {
  autoplay: false,
  loop: true,
  muted: true,
  controls: true,
  controlsList: ['nofullscreen', 'nodownload', 'noremoteplayback'].join(' '),
};

export default {
  name: 'ItemsPlayer',

  props: {
    muteVideo: {
      type: Boolean,
      default: true,
    },
  },

  emits: {
    click: null,
    'video:pause': null,
    'video:play': null,
    'currentItem:loaded': null,
    'currentItem:error': null,
  },

  data: () => {
    const itemObj = {
      name: '',
      src: '',
      data: undefined,
      styles: { opacity: 1, 'z-index': 2 },
      videoOptions: { ...defaultVideoOptions },
      isLoaded: false,
      isError: false,
      onLoadPromise: undefined,
      onLoadResolve: undefined,
      onLoadReject: undefined,
      onLoad: undefined,
      onError: undefined,
    };

    return {
      item1: {
        ...deepClone(itemObj),
        name: ITEM_1_NAME,
      },

      item2: {
        ...deepClone(itemObj),
        name: ITEM_2_NAME,
      },

      currentItemName: ITEM_1_NAME,
      switchWithTransition: false,
    };
  },

  computed: {
    currentItemData () { return this[this.currentItemName].data },

    nextItemName () { return this.currentItemName === ITEM_1_NAME ? ITEM_2_NAME : ITEM_1_NAME },
  },

  mounted () {
    this.$set(this.item1, 'onLoad', this.onLoadItem1);
    this.$set(this.item2, 'onLoad', this.onLoadItem2);
    this.$set(this.item1, 'onError', this.onErrorItem1);
    this.$set(this.item2, 'onError', this.onErrorItem2);
  },

  methods: {
    getItemName (i) { return `item${i + 1}` },

    getItems () { return [this.item1, this.item2] },

    getItem (itemName = this.currentItemName) { return this[itemName] },

    getItemRef (itemName = this.currentItemName) { return this.$refs[itemName][0] },

    getItemData (itemName = this.currentItemName) {
      return this.getItem(itemName).data;
    },

    getImageEl (itemName = this.currentItemName) {
      return this.getItemRef(itemName).querySelector('.item.img');
    },

    getVideoEl (itemName = this.currentItemName) {
      return this.getItemRef(itemName).querySelector('.item.vid');
    },

    /**
     * @public
     */
    getItemDuration (itemName = this.currentItemName) {
      let duration = 0;

      if (this.isItemVideo(itemName)) {
        const videoEl = this.getVideoEl(itemName);
        duration = (videoEl.duration || 0) * 1000;
      }

      return duration;
    },

    getCurrentItemSrc () { return this.currentItemData.src },

    isItemImage (itemName = this.currentItemName) { return !this.isItemVideo(itemName) },

    isItemVideo (itemName = this.currentItemName) {
      return this.getItemData(itemName)?.isVideo || false;
    },

    createLoadItemPromise (itemName = this.currentItemName) {
      const item = this.getItem(itemName);

      return new Promise((resolve, reject) => {
        this.$set(item, 'onLoadResolve', resolve);
        this.$set(item, 'onLoadReject', reject);
      }).then(() => {
        this.$set(item, 'isError', false);
        this.$set(item, 'isLoaded', true);
      }).catch(() => {
        this.$set(item, 'isError', true);
        this.$set(item, 'isLoaded', false);
      });
    },

    resetItem (itemName) {
      const item = this.getItem(itemName);
      this.$set(item, 'src', '');
      this.$set(item, 'data', undefined);
      this.$set(item, 'isLoaded', false);
      this.$set(item, 'isError', false);
    },

    setItemData (itemName, data) {
      const item = this.getItem(itemName);

      this.$set(item, 'onLoadPromise', this.createLoadItemPromise(itemName));

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      this.$set(item, 'src', `${data.src}?b=${Date.now()}`);

      this.$set(item, 'data', deepClone(data));
    },

    /**
     * @public
     */
    setNextItemData (nextItemData) {
      this.setItemData(this.nextItemName, nextItemData);
    },

    /**
     * @public
     */
    async showNextItem ({ animate = false } = {}) {
      const item = this.getItem(this.nextItemName);

      await item.onLoadPromise;

      await this.switchItems({ animate });

      this.resetItem(this.nextItemName);

      if (item.isLoaded) {
        this.$emit('currentItem:loaded', this.currentItemName);
      } else if (item.isError) {
        this.$emit('currentItem:error', { item });
      }
    },

    /**
     * @public
     */
    pauseItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.pauseVideo(itemName) }
    },

    /**
     * @public
     */
    playItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.playVideo(itemName) }
    },

    pauseVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).pause() },

    playVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).play() },

    async switchItems ({ animate = false } = {}) {
      let animateItemsPromise = Promise.resolve();

      const currentItem = this.getItem(this.currentItemName);
      const nextItem = this.getItem(this.nextItemName);

      this.switchWithTransition = animate;

      if (animate) {
        let currentItemPromiseResolve;

        animateItemsPromise = new Promise((resolveCurrent) => {
          currentItemPromiseResolve = resolveCurrent;
        });
        const currentItemRef = this.getItemRef(this.currentItemName);

        const onTransitionEndCurrentItem = () => {
          currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
          currentItemPromiseResolve();
        };

        currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);
      }

      this.pauseItem(this.currentItemName);

      this.$set(
        nextItem,
        'styles',
        { opacity: 1, 'z-index': 2 },
      );

      this.$set(
        currentItem,
        'styles',
        { opacity: 0, 'z-index': 1 },
      );

      await animateItemsPromise;

      this.currentItemName = this.nextItemName;
    },

    onItemLoaded (itemName) { this.getItem(itemName).onLoad() },

    onItemError (itemName, error) { this.getItem(itemName).onError(error) },

    onLoadItem1 () { this.item1.onLoadResolve() },

    onLoadItem2 () { this.item2.onLoadResolve() },

    onErrorItem1 (error) { this.item1.onLoadReject(error) },

    onErrorItem2 (error) { this.item2.onLoadReject(error) },

    onClick () { this.$emit('click') },

    onPauseVideo () { this.$emit('video:pause') },

    onPlayVideo () { this.$emit('video:play') },
  },
};
</script>

<style lang="scss" scoped>
.items-player {
  width: 100%;
  height: 100%;
  position: relative;

  .item-ctn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;

    &.transition {
      transition: opacity 200ms linear;
    }

    .item {
      object-fit: contain;
      width: 100%;
      height: 100%;
      outline: none;
    }

    .item.vid {
      &::-webkit-media-controls-fullscreen-button,
      &::-webkit-media-controls-download-button {
        display: none;
      }
    }
  }
}
</style>
