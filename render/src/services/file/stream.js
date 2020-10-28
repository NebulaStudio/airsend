export default class Stream {

    constructor(name) {
        this._name = name;
        this._buffer = [];
        this._mime = 'application/octet-stream';
    }

    append(chunk) {
        this._buffer.push(chunk);
    }

    close() {
        this._buffer = null;
    }

    save() {
        const blob = new Blob(this._buffer, {
            type: this._mime
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.addEventListener('click', () => setTimeout(() => document.body.removeChild(link), 100));
        link.download = this._name;
        link.href = url;
        link.target = '_blank';
        link.click();
    }
}