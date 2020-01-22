'use strict'

import GitHubApi from "github";

export const GITHUB_CONNECT = 1

export class GitHub {
  constructor(type) {
    let headers = {
      'user-agent': 'SpeedTracker agent'
    };
    switch (type) {
      case GITHUB_CONNECT:
        headers['Accept'] = 'application/vnd.github.swamp-thing-preview+json';
        break;
    }
    this.api = new GitHubApi({
      debug: (process.env.NODE_ENV !== 'production'),
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      pathPrefix: '',
      headers,
      timeout: 5000,
      Promise: Promise
    });
  }
  authenticate(token) {
    this.api.authenticate({
      type: 'oauth',
      token: token
    });
    return this;
  }
}


