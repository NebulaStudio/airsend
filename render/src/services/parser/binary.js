const isArray = require('isarray');
const isBuf = require('./isBuffer');
const toString = Object.prototype.toString;

const withNativeBlob = typeof Blob === 'function' || (typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]');
const withNativeFile = typeof File === 'function' || (typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]');

exports.deconstructPacket = function (packet) {
    var buffers = [];
    var packetData = packet.data;
    var pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length;
    return {
        packet: pack,
        buffers: buffers
    };
};

function _deconstructPacket(data, buffers) {
    if (!data) return data;
    if (isBuf(data)) {
        var placeholder = {
            _placeholder: true,
            num: buffers.length
        };
        buffers.push(data);
        return placeholder;
    } else if (isArray(data)) {
        let newData = new Array(data.length);
        for (var i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i], buffers);
        }
        return newData;
    } else if (typeof data === 'object' && !(data instanceof Date)) {
        let newData = {};
        for (var key in data) {
            newData[key] = _deconstructPacket(data[key], buffers);
        }
        return newData;
    }
    return data;
}

exports.reconstructPacket = function (packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    packet.attachments = undefined;
    return packet;
};

function _reconstructPacket(data, buffers) {
    if (!data) return data;
    if (data && data._placeholder) {
        return buffers[data.num];
    } else if (isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i], buffers);
        }
    } else if (typeof data === 'object') {
        for (var key in data) {
            data[key] = _reconstructPacket(data[key], buffers);
        }
    }
    return data;
}

exports.removeBlobs = function (data, callback) {
    function _removeBlobs(obj, curKey, containingObject) {
        if (!obj) return obj;
        if ((withNativeBlob && obj instanceof Blob) ||
            (withNativeFile && obj instanceof File)) {
            pendingBlobs++;
            var fileReader = new FileReader();
            fileReader.onload = function () {
                if (containingObject) {
                    containingObject[curKey] = this.result;
                } else {
                    bloblessData = this.result;
                }
                if (!--pendingBlobs) {
                    callback(bloblessData);
                }
            };
            fileReader.readAsArrayBuffer(obj);
        } else if (isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                _removeBlobs(obj[i], i, obj);
            }
        } else if (typeof obj === 'object' && !isBuf(obj)) {
            for (var key in obj) {
                _removeBlobs(obj[key], key, obj);
            }
        }
    }
    var pendingBlobs = 0;
    var bloblessData = data;
    _removeBlobs(bloblessData);
    if (!pendingBlobs) {
        callback(bloblessData);
    }
};