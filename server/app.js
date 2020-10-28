const path = require('path');
const http = require('http');
const express = require('express');
const SocketServer = require('./socketServer');

const port = 8080;
const app = express();
const static = path.join(__dirname, 'static');
const public = path.join(__dirname, 'public');
app.use(express.static(static));
app.use(express.static(public));
app.use('/', require('./routes/index'));
const server = http.createServer(app);
server.listen(port, () => console.log(`listen:${port}`));
const socket = new SocketServer(server);
socket.serve();
