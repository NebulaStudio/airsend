const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;

class Turn {
  constructor() {
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  add(user, realm, password) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) {
            return reject(err);
          }
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          const doc = {
            realm,
            name: user,
            hmackey: password,
          };
          await collection.insertOne(doc);
          await client.close();
          resolve();
        }
      );
    });
  }

  remove(user) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) return reject(err);
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          const doc = {
            name: user,
          };
          await collection.deleteOne(doc);
          await client.close();
          resolve();
        }
      );
    });
  }

  clean() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) return reject(err);
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          await collection.deleteMany({});
          await client.close();
          resolve();
        }
      );
    });
  }
}

module.exports = new Turn();
