/* eslint-env worker */
/* global addEventListener:true */
const { ATAWorker } = require('@netacea/cloudflare-worker')

const worker = new ATAWorker({
  apiKey: 'YOUR-API-KEY-HERE'
})

addEventListener('fetch', event => {
  event.respondWith(runNetaceaWithRequest(event))
})

async function runNetaceaWithRequest (event) {
  let response
  let requestStartTime = Date.now()
  let requestLength = 0
  requestStartTime = Date.now()
  response = await handleRequestWithCustomLogic(event.request)
  requestLength = Date.now() - requestStartTime
  event.waitUntil(worker.logRequest(event, response, requestLength))
  return response
}

async function handleRequestWithCustomLogic (request) {
  // Custom pre-fetch logic here. Must return fetch response from function
  return fetch(request)
}
