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
        (err, client) => {
          if (err) {
            console.log('turn add ', err);
            return reject(err);
          }
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          const doc = {
            realm,
            name: user,
            hmackey: password,
          };
          collection.insertOne(doc, (err) => {
            client.close();
            if (err) {
              console.log('turn add 2 ', err);
              return reject(err);
            }
            resolve();
          });  
        }
      );
    });
  }

  remove(user) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        (err, client) => {
          if (err) {
            console.log('turn remove ', err);
            return reject(err);
          }
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          const doc = {
            name: user,
          };
          collection.deleteOne(doc, (err) => {
            client.close();
            if (err) {
              console.log('turn remove 2 ', err);
              return reject(err);
            }
            resolve();
          }); 
        }
      );
    });
  }

  clean() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        (err, client) => {
          if (err) {
            console.log('turn clean ', err);
            return reject(err);
          }
          const db = client.db(config.databaseName);
          const collection = db.collection('turnusers_lt');
          collection.deleteMany({}, (err) => {
            if (err) {
              console.log('turn clean 2 ', err);
              return reject(err);
            }
            resolve();
          });
        }
      );
    });
  }
}

module.exports = new Turn();
