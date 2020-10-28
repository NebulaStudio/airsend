const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;

class Online {
  constructor() {
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  add(rid, user) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) return reject(err);
          const db = client.db(config.databaseName);
          const collection = db.collection('online');
          let item = await collection.findOne({
            rid,
          });
          if (item) {
            await collection.updateOne(
              {
                rid,
              },
              {
                $addToSet: {
                  users: user,
                },
              }
            );
          } else {
            item = {
              rid,
              users: [user],
            };
            await collection.insertOne(item);
          }
          await client.close();
          resolve();
        }
      );
    });
  }

  remove(rid, id) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) return reject(err);
          const db = client.db(config.databaseName);
          const collection = db.collection('online');
          await collection.updateOne(
            {
              rid,
            },
            {
              $pull: {
                users: {
                  id,
                },
              },
            }
          );
          await collection.deleteOne({
            rid,
            users: {
              $size: 0,
            },
          });
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
          const collection = db.collection('online');
          await collection.deleteMany({});
          await client.close();
          resolve();
        }
      );
    });
  }

  get(rid) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        async (err, client) => {
          if (err) return reject(err);
          const db = client.db(config.databaseName);
          const collection = db.collection('online');
          const e = await collection.findOne({
            rid,
          });
          await client.close();
          return e ? resolve(e.users) : resolve([]);
        }
      );
    });
  }
}

module.exports = new Online();
