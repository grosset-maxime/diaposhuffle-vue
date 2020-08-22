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
  } = {}) {
    this.width = width;
    this.height = height;
    this.src = src;
    this.name = name;
    this.extension = extension.toLowerCase();
    this.customFolderPath = customFolderPath;
    this.randomPublicPath = randomPublicPath;
    this.tags = tags;
    this.warning = warning;
    this.useCache = useCache;

    this.isVideo = this.VIDEO_EXTENSIONS.includes(this.extension);
    this.isImage = this.IMG_EXTENSIONS.includes(this.extension);
  }
}

export function createItem (data) {
  return new Item(data);
}
