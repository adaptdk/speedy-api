'use strict'

import config from '../config';
import ErrorHandler  from './ErrorHandler';
import SpeedTracker from './SpeedTracker';

export default class Scheduler {
  constructor(options) {
    this.db = options.db;
    this.remote = options.remote;
    this.timer = setInterval(() => {
      this._checkTests();
    }, config.get('scheduling.checkInterval'));
    this._checkTests();
  }
  _checkTests() {
    const currentTime = new Date().getTime();
    this.db.collection(config.get('database.reposCollection')).find({
      nextRun: {
        $lte: currentTime
      }
    }).each((err, doc) => {
      if (doc) {
        const nwo = doc.repository.split('/');
        const speedtracker = new SpeedTracker({
          db: this.db,
          branch: doc.branch,
          key: doc.key,
          remote: this.remote,
          repo: nwo[1],
          scheduler: this,
          user: nwo[0]
        });
        speedtracker.runTest(doc.profile, true).catch(err => {
          //ErrorHandler.log(`Deleting failed scheduled test with id ${doc._id}...`)
          //this.delete(doc)
        });
      }
    });
  }
  _getNextRun(profile) {
    const currentTime = new Date().getTime();
    const interval = Math.max(profile.interval, config.get('scheduling.minimumInterval'));
    const nextRun = currentTime + (interval * 3600000);
    return nextRun;
  }
  delete(schedule) {
    return new Promise((resolve, reject) => {
      this.db.collection(config.get('database.reposCollection')).deleteOne({
        _id: schedule._id
      }, (err, results) => {
        if (err)
          return reject(err);
        return resolve(null);
      });
    });
  }
  find(repository, profile) {
    return new Promise((resolve, reject) => {
      this.db.collection(config.get('database.reposCollection')).findOne({
        profile,
        repository
      }, (err, document) => {
        if (err)
          return reject(err);
        return resolve(document);
      });
    });
  }
  insert(profile, branch, key) {
    const nextRun = this._getNextRun(profile);
    return new Promise((resolve, reject) => {
      this.db.collection(config.get('database.reposCollection')).insert({
        branch,
        interval: profile.interval,
        key,
        nextRun,
        profile: profile._id,
        repository: profile._nwo,
      }, (err, documents) => {
        if (err)
          return reject(err);
        return resolve(nextRun);
      });
    });
  }
  update(profile, schedule) {
    const nextRun = this._getNextRun(profile);
    return new Promise((resolve, reject) => {
      this.db.collection(config.get('database.reposCollection')).update({
        _id: schedule._id
      }, {
          $set: {
            interval: profile.interval,
            nextRun
          }
        }, (err, data) => {
          if (err)
            return reject(err);
          return resolve(nextRun);
        });
    });
  }
}

