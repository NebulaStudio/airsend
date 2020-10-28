const path = require('path');
const express = require('express');
const icon = require('../services/icon/index');
const router = express.Router();

router.get('/icons/link', (req, resp) => {
    let svg = icon.get('link');
    const file = path.join(__dirname, '..', 'static', 'icon', svg);
    resp.sendfile(file);
});

router.get('/icons/text', (req, resp) => {
    let svg = icon.get('text');
    const file = path.join(__dirname, '..', 'static', 'icon', svg);
    resp.sendfile(file);
});

router.get('/icons/file/:dir/:name(*)', (req, resp) => {
    const name = req.params.name;
    const isDir = req.params.dir === "1";
    let svg = icon.get('file', name, isDir);
    const file = path.join(__dirname, '..', 'static', 'icon', svg);
    resp.sendfile(file);
});

module.exports = router;