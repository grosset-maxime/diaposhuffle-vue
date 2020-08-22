export class Item {
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
    this.extension = extension;
    this.customFolderPath = customFolderPath;
    this.randomPublicPath = randomPublicPath;
    this.tags = tags;
    this.warning = warning;
    this.useCache = useCache;
  }
}

export function createItem (data) {
  return new Item(data);
}
