/* eslint-env worker */
/* global addEventListener:true */
const { ATAWorker } = require('@netacea/cloudflare-worker')

addEventListener('fetch', event => {
  event.respondWith(runNetaceaWithRequest(event))
})

const worker = new ATAWorker({
  apiKey: 'YOUR-API-KEY-HERE',
  secretKey: 'YOUR-SECRET-KEY-HERE'
})

async function runNetaceaWithRequest (event) {
  let response
  let requestStartTime = Date.now()
  let requestLength = 0
  const mitigationServiceResponse = await worker.mitigate(event)
  if (mitigationServiceResponse.mitigated) {
    response = mitigationServiceResponse.response
    response = new Response(response.body, response)
    requestLength = Date.now() - requestStartTime
  } else {
    requestStartTime = Date.now()
    response = await handleRequest(event.request, mitigationServiceResponse)
    requestLength = Date.now() - requestStartTime
  }
  event.waitUntil(worker.logRequest(event, response, requestLength, mitigationServiceResponse))
  return response
}

async function handleRequest (request, mitServiceResponse) {
  const response = await fetch(request)
  const headers = new Headers(request.headers)

  if (mitServiceResponse.setCookie) {
    headers.set('Set-Cookie', mitServiceResponse.setCookie)
  }

  // Custom pre-fetch logic here. Must return fetch response object from function

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText
  })
}
