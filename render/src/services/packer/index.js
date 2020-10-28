import events from "events";
import compress from "./zip";

export default class Packer extends events.EventEmitter {
    /**
     * canPack 
     * @param {Array} files 
     */
    canPack(files) {
        return new Promise(resolve => {
            if (files.length > 1) {
                resolve(true);
            }
            const file = files[0];
            this._isFile(file).then(e => {
                if (e) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    pack(e, fn) {
        return new Promise((resolve, reject) => {
            this._prepare(e, fn).then(t => {
                const items = t.files;
                const isDir = t.isDir;
                const ready = "正在压缩..."; // ready to packing
                fn(ready)
                let percent;
                compress(items, metadata => {
                    const value = metadata.percent.toFixed(0);
                    if (percent == value) return;
                    percent = value;
                    const message = `正在压缩 ${value} %`; // packing percent
                    fn(message);
                }).then(blob => {
                    resolve({
                        isDir,
                        stream: blob
                    });
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    _prepare(items, fn) {
        return new Promise((resolve, reject) => {
            if (items instanceof DataTransferItemList) {
                this._getFiles(items, fn).then(e => {
                    resolve(e);
                }).catch(err => reject(err));
            } else {
                const files = [];
                for (let item of items) {
                    let file = {
                        name: item.name,
                        file: item
                    }
                    fn(`准备文件: ${item.name}`); // ready file
                    files.push(file)
                }
                resolve({
                    files: files,
                    isDir: false,
                });
            }
        });
    }

    _isFile(file) {
        return new Promise(resolve => {
            if (file instanceof window.File) {
                if (file.size > 1048576) {
                    resolve(true);
                } else {
                    const reader = new FileReader();
                    reader.onload = function () {
                        resolve(true);
                    };
                    reader.onerror = function () {
                        resolve(false);
                    };
                    reader.readAsArrayBuffer(file);
                }
            } else if (file instanceof window.DataTransferItem) {
                const entry = file.webkitGetAsEntry();
                resolve(entry.isFile);
            } else {
                resolve(false);
            }
        });
    }

    _getFiles(items, fn) {
        return new Promise((resolve, reject) => {
            const promises = [];
            let isDir = false;
            let count = 0;
            for (const item of items) {
                if (item.kind === 'file') {
                    count++;
                    const entry = item.webkitGetAsEntry();
                    if (entry.isFile) {
                        promises.push(Promise.resolve([entry]));
                    } else if (entry.isDirectory) {
                        isDir = true;
                        promises.push(this._getEntriesAsAsyncIterator(entry, null, fn));
                    }
                }
            }
            Promise.all(promises).then(e => {
                const entries = [];
                for (let items of e) {
                    for (let item of items) {
                        entries.push(item);
                    }
                }
                Promise.all(this._getFilesSync(entries)).then(files => {
                    resolve({
                        isDir,
                        files,
                        count
                    });
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        })
    }

    async _getEntriesAsAsyncIterator(dir, files, fn) {
        files = files || [];
        let items = await new Promise((resolve) => {
            let reader = dir.createReader();
            reader.readEntries(entries => resolve(entries));
        });
        for (let item of items) {
            if (item.isDirectory) {
                await this._getEntriesAsAsyncIterator(item, files, fn);
            } else {
                fn(`准备打包文件: ${item.name}`);
                files.push(item);
            }
        }
        return files;
    }

    _getFilesSync(entries) {
        const promises = [];
        for (let entry of entries) {
            promises.push(new Promise((resolve, reject) => entry.file(f => {
                const item = {
                    file: f,
                    name: entry.fullPath.substr(1)
                }
                resolve(item);
            }, reject)));
        }
        return promises;
    }
}