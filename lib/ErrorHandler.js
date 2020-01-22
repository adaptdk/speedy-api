'use strict'

import config from "../config"
import Client from 'raygun';

const ErrorHandler = function () {
  if (config.get('raygunApiKey').length) {
    this.client = new Client().init({
      apiKey: config.get('raygunApiKey')
    })
  }
}

ErrorHandler.prototype.log = function (error) {
  if (this.client) {
    if (!(error instanceof Error)) {
      error = new Error(error)
    }

    this.client.send(error)
  } else {
    console.log(error)
  }
}

export default (() => {
  return new ErrorHandler()
})()
