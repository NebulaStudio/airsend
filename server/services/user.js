const crypto = require('crypto');
const config = require('../config');
const turnService = require('./database/turn');
const avatarService = require('./database/avatar');
const onlineService = require('./database/online');

class User {
  async join(id, rid, address) {
    const avatar = await this._getAvatar(rid);
    if (avatar == null) return null;
    const user = {
      id: id,
      ...avatar,
      ip: address,
    };
    await onlineService.add(rid, user);
    user.rid = rid;
    user.status = 0;
    user.message = '';
    user.request = {};
    return user;
  }

  async generateTicket(id, rid) {
    const realm = config.realm;
    const name = crypto.createHash('md5').update(id).digest('hex');
    const password = crypto
      .createHash('md5')
      .update(`${id}:${rid}`)
      .digest('hex');
    const orig = `${name}:${realm}:${password}`;
    const hmackey = crypto.createHash('md5').update(orig).digest('hex');
    await turnService.add(name, realm, hmackey);
    const iceServer = {
      iceServers: [
        {
          url: `stun:${config.iceServer}`,
        },
        {
          url: `turn:${config.iceServer}`,
          username: name,
          credential: password,
        },
      ],
    };
    return iceServer;
  }

  async leave(id, rid) {
    await onlineService.remove(rid, id);
    const name = crypto.createHash('md5').update(id).digest('hex');
    await turnService.remove(name);
  }

  async clean() {
    await onlineService.clean();
    await turnService.clean();
  }

  async getPeers(id, rid) {
    const items = [];
    const users = await onlineService.get(rid);
    const iceServers = await this.generateTicket(id, rid);
    for (const user of users) {
      const item = {
        ...user,
        status: 0,
        message: '',
        request: {},
      };
      if (user.id === id) {
        item.yourself = true;
        item.rid = rid;
        item.iceServer = iceServers;
      }
      items.push(item);
    }
    return items;
  }

  async _getAvatar(rid) {
    const avatars = await avatarService.get();
    const users = await onlineService.get(rid);
    const array = this._generate(avatars.length);
    if (users.length == array.length) return null;
    for (const index of array) {
      const avatar = avatars[index];
      if (users.findIndex((t) => t.icon === avatar.icon) === -1) return avatar;
    }
    return null;
  }

  _generate(max) {
    const array = new Array();
    while (array.length < max) {
      const value = Math.floor(Math.random() * max);
      if (array.findIndex((t) => t == value) !== -1) continue;
      array.push(value);
    }
    return array;
  }
}
module.exports = new User();
