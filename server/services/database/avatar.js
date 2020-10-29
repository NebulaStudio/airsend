const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;

class Avatar {
  constructor() {
    this.items = null;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    this.init();
  }

  init() {
    this.get().then((e) => {
      if (e.length === 0) {
        MongoClient.connect(
          config.mongodbUrl,
          this.options,
          async (err, client) => {
            if (err) {
              console.log(err);
              return;
            }
            const db = client.db(config.databaseName);
            const collection = db.collection('avatar');
            const docs = [
              {
                label: '妲己',
                icon: '1.jpg',
              },
              {
                label: '鲁班',
                icon: '2.jpg',
              },
              {
                label: '庄周',
                icon: '3.jpg',
              },
              {
                label: '高渐离',
                icon: '4.jpg',
              },
              {
                label: '孙膑',
                icon: '5.jpg',
              },
              {
                label: '芈月',
                icon: '6.jpg',
              },
              {
                label: '甄姬',
                icon: '7.jpg',
              },
              {
                label: '狄仁杰',
                icon: '8.jpg',
              },
              {
                label: '安琪拉',
                icon: '9.jpg',
              },
              {
                label: '程咬金',
                icon: '10.jpg',
              },
              {
                label: '不知火舞',
                icon: '11.jpg',
              },
              {
                label: '后羿',
                icon: '12.jpg',
              },
              {
                label: '蔡文姬',
                icon: '13.jpg',
              },
              {
                label: '凯',
                icon: '14.jpg',
              },
              {
                label: '裴擒虎',
                icon: '15.jpg',
              },
              {
                label: '瑶',
                icon: '16.jpg',
              },
              {
                label: '明世隐',
                icon: '17.jpg',
              },
              {
                label: '沈梦溪',
                icon: '18.jpg',
              },
              {
                label: '雅典娜',
                icon: '19.jpg',
              },
              {
                label: '貂蝉',
                icon: '20.jpg',
              },
              {
                label: '刘禅',
                icon: '21.jpg',
              },
              {
                label: '武则天',
                icon: '22.jpg',
              },
              {
                label: '小乔',
                icon: '23.jpg',
              },
              {
                label: '张良',
                icon: '24.jpg',
              },
            ];
            await collection.insertMany(docs);
            await client.close();
          }
        );
      }
    });
  }

  get() {
    return new Promise((resolve, reject) => {
      if (this.items) {
        return resolve(this.items);
      }
      MongoClient.connect(
        config.mongodbUrl,
        this.options,
        (err, client) => {
          if (err) {
            console.log('avatar get ', err);
            return reject(err);
          }
          const db = client.db(config.databaseName);
          const collection = db.collection('avatar');
          collection.find({},
            {
              label: 1,
              icon: 1,
            }).toArray((err, result) => {
              client.close();
              if (err) {
                console.log('avatar get 2', err);
                return reject(err);
              } 
              this.items = result;
              resolve(result);
            }); 
        }
      );
    });
  }
}

module.exports = new Avatar();
