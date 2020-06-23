const EventEmitter = require('events')
const proxyquire = require('proxyquire').noCallThru()

const helpers = {
  randomString: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  runTest: (t, {
    originResponse
  }, assertions, request = new Request(new URL('http://fake-address.com'))) => {
    const event = {
      request
    }
    let originCalled = false
    let logRequestCalled = false
    const myEmitter = new EventEmitter()
    global.addEventListener = (key, event) => myEmitter.on(key, event)

    // This will fake the origin fetch call
    global.fetch = async () => {
      originCalled = true
      return Promise.resolve(originResponse)
    }
    proxyquire('../index.js', {
      '@netacea/cloudflare-worker': {
        ATAWorker: class ATAWorker {
          constructor ({
            apiKey
          }) {
            t.ok(apiKey, 'Expects apiKey to always be provided')
          }
          async mitigate (event) {
            throw new Error('Not implemented in these tests. This is not to be called')
          }
          async logRequest (event, response, requestLength, mitigationServiceResponse) {
            t.equals(mitigationServiceResponse, undefined, 'Expects mitigationServiceResponse to be undefined')
            logRequestCalled = true
            return Promise.resolve()
          }
        }
      }
    })
    event.respondWith = async (workerFunction) => {
      const response = await workerFunction
      assertions(response, {
        logRequestCalled,
        originCalled
      })
      return response
    }
    event.waitUntil = async (waitUntilFn) => {
      await waitUntilFn
    }
    myEmitter.emit('fetch', event)
  }
}

module.exports = helpers