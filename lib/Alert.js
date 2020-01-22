'use strict'

import Email from './alerts/Alert.Email'
import SlackWebhook from './alerts/Alert.SlackWebhook'

  
export default class Alert {
  constructor(data) {
    this.data = data;
    switch (data.schema.type) {
      case 'email':
        this.handler = new Email(data);
        break;
      case 'slack':
        this.handler = new SlackWebhook(data);
        break;
    }
  }
  send(template, infractors) {
    return this.handler.send(template, infractors);
  }
}

