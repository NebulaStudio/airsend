const supports = require('./supports');

const defaultFileKey = '_file';
const defaultFolderKey = '_folder';
const defaultLinkIcon = 'file_type_link.svg';
const defaultTextIcon = 'file_type_text.svg';

class Icon {
  get(type, name, isDir) {
    switch (type) {
      case 'link':
        return defaultLinkIcon;
      case 'text':
        return defaultTextIcon;
      default:
        return this._getIcon(name, isDir);
    }
  }

  _getIcon(name, isDir) {
    if (isDir) {
      let key = supports.folderNames[name] || defaultFolderKey;
      let item = supports.iconDefinitions[key];
      if (!item) {
        item = supports.iconDefinitions[defaultFolderKey];
      }
      return item.icon;
    }
    let key = supports.fileNames[name];
    if (!key) {
      const index = name.lastIndexOf('.');
      if (index + 1 === name.length) {
        key = defaultFileKey;
      } else {
        const ext = name.substr(index + 1);
        key = supports.fileExtensions[ext] || defaultFileKey;
      }
    }
    let item = supports.iconDefinitions[key];
    if (!item) {
      item = supports.iconDefinitions[defaultFileKey];
    }
    return item.icon;
  }
}

module.exports = new Icon();
