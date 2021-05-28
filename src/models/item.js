export class Item {
  VIDEO_EXTENSIONS = ['webm', 'mp4', 'mkv'];

  IMG_EXTENSIONS = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'tif'];

  constructor ({
    width = 0,
    height = 0,
    src = '',
    name = '',
    extension = '',
    customFolderPath = '',
    randomPublicPath = '',
    tags = [],
    warning = '',
    useCache = false,
    isImage = undefined,
    isVideo = undefined,
  } = {}) {
    if (!src) {
      throw new Error(`Invalid item, item has no src. Item src: ${src}`);
    }

    this.width = width;
    this.height = height;
    this.src = src;
    this.name = name;
    this.extension = extension?.toLowerCase() || '';
    this.customFolderPath = customFolderPath;
    this.randomPublicPath = randomPublicPath;
    this.tags = tags;
    this.warning = warning;
    this.useCache = useCache;

    this.isImage = isImage ?? this.IMG_EXTENSIONS.includes(this.extension);
    this.isVideo = isVideo ?? this.VIDEO_EXTENSIONS.includes(this.extension);

    if (!this.isImage && !this.isVideo) {
      throw new Error(`Invalid item, not an image and not a video. Item extension: ${extension}`);
    }
  }
}

export function createItem (data) {
  return new Item(data);
}
