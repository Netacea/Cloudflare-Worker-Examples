const EventEmitter = require('events')
const proxyquire = require('proxyquire').noCallThru()

const helpers = {
  randomString: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  runTest: (t, {
    mitigateResponse,
    originResponse
  }, assertions, event) => {
    let mitigateCalled = false
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
            apiKey,
            secretKey
          }) {
            t.ok(apiKey, 'Expects apiKey to always be provided')
            t.ok(secretKey, 'Expects secretKey to always be provided')
          }
          async mitigate (event) {
            const mitigateDefaults = {
              mitigationApplied: '',
              setCookie: null,
              mitServiceStatus: 0,
              mitigated: false,
              response: new Response()
            }
            mitigateCalled = true
            return Promise.resolve(Object.assign(mitigateDefaults, mitigateResponse))
          }
          async logRequest (event, response, requestLength, mitigationServiceResponse) {
            logRequestCalled = true
            return Promise.resolve()
          }
        }
      }
    })

    event.respondWith = async (workerFunction) => {
      const response = await workerFunction
      assertions(response, {
        mitigateCalled,
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