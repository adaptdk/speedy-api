'use strict'

import config from '../../config';
import SparkPost from "sparkpost"
import {decrypt} from '../utils';

export default class Email {
  constructor(data) {
    this.api = new SparkPost(config.get('email.sparkboxApiKey'));
    this.data = data;
    this.templates = {
      budget: require(__dirname + '/../../templates/email.budget.js')
    };
  }
  send(templateName, infractors) {
    const recipients = this.data.schema.recipients.map(recipient => {
      return decrypt(recipient, this.data.config._encryptionKey);
    });
    const template = this.templates[templateName];
    const email = template(infractors, this.data);
    return new Promise((resolve, reject) => {
      this.api.transmissions.send({
        transmissionBody: {
          content: {
            from: email.sender,
            subject: email.subject,
            html: email.body
          },
          recipients: recipients.map(recipient => {
            return { address: recipient };
          })
        }
      }, (err, res) => {
        if (err)
          return reject(err);
        return resolve(res);
      });
    });
  }
}
