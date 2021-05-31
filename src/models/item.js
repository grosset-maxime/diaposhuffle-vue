const VIDEO_EXTENSIONS = ['webm', 'mp4', 'mkv'];

const IMG_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'tif'];

function getComputedPath (src) {
  const computedPath = src.split('/');
  computedPath.shift();
  computedPath.pop();

  return computedPath.join('/');
}

export class Item {
  constructor ({
    width = 0,
    height = 0,
    src = '',
    name = '',
    path,
    extension = '',
    customFolderPath = '',
    randomPublicPath,
    tags = [],
    warning = '',
    useCache = false,
    isImage = undefined,
    isVideo = undefined,
  } = {}) {
    if (!src) {
      throw new Error(`Invalid item, item has no src. Item src: ${src}`);
    }

    const splitedSrc = src.split('/').filter((p) => p);

    this.src = splitedSrc.join('/');
    this.name = (name || [...splitedSrc].pop()) || '';
    this.extension = (extension || this.name.split('.').pop()).toLowerCase() || '';
    this.path = path ?? getComputedPath(this.src);

    this.width = width;
    this.height = height;

    this.customFolderPath = customFolderPath;
    this.randomPublicPath = randomPublicPath ?? path;

    this.tags = tags;

    this.warning = warning;
    this.useCache = useCache;

    this.isImage = isImage ?? IMG_EXTENSIONS.includes(this.extension);
    this.isVideo = isVideo ?? VIDEO_EXTENSIONS.includes(this.extension);

    if (!this.isImage && !this.isVideo) {
      console.error('Item:', this);
      throw new Error(`Invalid item, not an image and not a video. Item extension: ${extension}`);
    }
  }
}

export function createItem (data) {
  return new Item(data);
}
