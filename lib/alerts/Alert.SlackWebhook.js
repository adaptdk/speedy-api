'use strict'

import IncomingWebhook from '@slack/client';
import get from 'object-path';
import {metrics} from '../../constants';
import {formatMetric, decrypt} from '../utils';

export default class SlackWebhook {
  constructor(data) {
    this.data = data;
  }
  _getBudgetTemplate(infractors) {
    const payload = {
      text: `The latest performance report on *${this.data.profile.name}* showed some performance metrics going over their budget:`,
      attachments: [
        {
          fallback: 'SpeedTracker performance report',
          color: 'warning',
          title: 'SpeedTracker - View report',
          title_link: this.data.config._url || 'https://speedtracker.org',
          fields: infractors.map(infractor => {
            const comparisonSign = infractor.value > infractor.limit ? '>' : '<';
            const metric = get(metrics, infractor.metric);
            const title = (metric && metric.name) || infractor.metric;
            return {
              title,
              value: `${formatMetric(infractor.metric, infractor.value)} (${comparisonSign} ${formatMetric(infractor.metric, infractor.limit)})`,
              short: 'false'
            };
          }),
          footer: 'SpeedTracker',
          footer_icon: 'https://speedtracker.org/assets/images/logo-square-inverted-128.png'
        }
      ]
    };
    return payload;
  }
  send(template, infractors) {
    if (!this.data.schema.hookUrl)
      return;
    const url = decrypt(this.data.schema.hookUrl, this.data.config._encryptionKey);
    const api = new IncomingWebhook(url);
    let payload;
    switch (template) {
      case 'budget':
        payload = this._getBudgetTemplate(infractors);
        break;
    }
    if (this.data.schema.channel) {
      payload.channel = this.data.schema.channel;
    }
    if (this.data.schema.username) {
      payload.username = this.data.schema.username;
    }
    if (this.data.schema.iconEmoji) {
      payload.iconEmoji = this.data.schema.iconEmoji;
    }
    api.send(payload);
  }
}
