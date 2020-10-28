import JSZip from 'jszip';

function compress(files, fn) {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();
        for (let e of files) {
            zip.file(e.name, e.file);
        }
        zip.generateAsync({
            type: "blob",
            mimeType: "application/octet-stream"
        }, fn).then(blob => resolve(blob)).catch(err => reject(err));
    })
}

export default compress;