'use strict'

const config = require(__dirname + '/../config')
const mongodb = require('mongodb')


const options = {
  keepAlive: 1,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const Database = function (callback) {
  mongodb.MongoClient.connect(config.get('database.uri'), options, (err, db) => {
    if (err) throw err

    // Store connection
    this.db = db.db(config.get('database.name'))

    // Create schema
    this.createSchema(callback)
  }) 
}

Database.prototype.createSchema = function (callback) {
  // Create `repos` collection
  console.log(this.db)
  this.db.createCollection(config.get('database.reposCollection'), (err, collection) => {
    if (err) throw err

    // Add index
    collection.createIndex({'repository': 1, 'profile': 1}, null, (err, results) => {
      if (err) throw err

      if (typeof callback === 'function') {
        callback(this.db)
      }
    })
  })
}

module.exports = Database
