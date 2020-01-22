import {metrics} from '../constants';
import objectPath  from 'object-path'
import {formatMetric } from "../lib/utils"

const email = (infractors, data) => {
  const body = `
    Hello,<br>
    <br>
    The latest performance report on <a href="${data.config._url}/${data.profile._id}">${data.profile.name}</a> showed some performance metrics going over their configured budgets:<br>
    <br>
    <ul>
    ${infractors.map(infractor => {
      const comparisonSign = infractor.value > infractor.limit ? '>' : '<'
      const metric = objectPath.get(metrics, infractor.metric)
      
      return `<li><strong>${metric.name}</strong>: ${formatMetric(infractor.metric, infractor.value)} (${comparisonSign} ${formatMetric(infractor.metric, infractor.limit)})</strong>`
    }).join('')}
    </ul>
    <br>
    <a href="${data.config._url}/${data.profile._id}">Click here</a> to see the full report.<br>
    <br>
    ---
    <br>
    <a href="https://speedtracker.org">SpeedTracker</a>
    `

  return {
    body,
    sender: 'SpeedTracker <noreply@speedtracker.org>',
    subject: `Performance report for ${data.profile.name}`
  }
}

module.exports = email
