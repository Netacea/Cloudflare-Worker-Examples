const {
  randomString,
  runTest
} = require ('./testHelpers')
const test = require('tape')
const fetch = require('node-fetch')
// Fake global fetch variables with node-fetch implementations
global.Headers = fetch.Headers
global.Response = fetch.Response
global.Request = fetch.Request
const globalAssertionCount = 2

const statusCodeTests = [200, 201, 202, 400, 403, 301, 602]
statusCodeTests.forEach(status => {
  test('LogRequest :: Log request is called on successful origin response', t => {
    t.plan(2 + globalAssertionCount)
    const originResponse = new fetch.Response({}, {
      status
    })
    originResponse.status = status
    runTest(t, {
      originResponse
    }, (response, servicesCalled) => {
      t.equals(response.status, status, `Expects reponse status to be '${status}`)
      t.ok(servicesCalled.logRequestCalled, 'Expects logRequest to be called')
    })
  })
})
