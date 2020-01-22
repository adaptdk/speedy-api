'use strict'

import {metrics} from '../constants';
import createDecipher from 'crypto';
import objectPath  from 'object-path'

const { get, set } = objectPath;

export function buildError(code, message) {
  let errorObject = {
    success: false,
    error: {
      code
    }
  }

  if (message) {
    errorObject.error.message = message
  }

  return errorObject
}

export function decrypt(passphrase, key) {
  let decipher = createDecipher('aes-256-ctr', key)
  let decrypted = decipher.update(passphrase, 'hex', 'utf8')
  
  decrypted += decipher.final('utf8')
  
  return decrypted
}

export function formatMetric(metricName, value) {
  const metric = get(metrics, metricName)

  if (!metric) return

  let output = value

  if (metric.transform) {
    output = metric.transform(output)
  }

  if (metric.unit) {
    output += metric.unit
  }

  return output
}

export function padWithZeros(input, length) {
  let inputStr = input.toString()
  let lengthDiff = length - inputStr.length

  if (lengthDiff > 0) {
    return '0'.repeat(lengthDiff) + inputStr
  }

  return inputStr
}

const traverseObject = (obj, callback, path) => {
  path = path || []

  if ((typeof obj === 'object') && !(obj instanceof Array) && (obj !== null)) {
    Object.keys(obj).forEach(key => {
      traverseObject(obj[key], callback, path.concat(key))
    })
  } else {
    callback(obj, path)
  }
}

const _traverseObject = traverseObject;
export { _traverseObject as traverseObject };

export function mergeObject(base, newObj, length) {
  traverseObject(newObj, (obj, path) => {
    let joinedPath = path.join('.')
    let baseValue = get(base, joinedPath)

    if (typeof baseValue === 'undefined') {
      const emptyArray = Array.apply(null, {length: length - 1}).map(() => null)

      set(base, joinedPath, emptyArray)

      baseValue = get(base, joinedPath)
    }

    baseValue.push(obj)
  })
}
