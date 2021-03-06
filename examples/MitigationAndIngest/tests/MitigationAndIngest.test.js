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


test('Initial Request :: Origin response headers persisted when mitigation service is called', t => {
  const netaceaSetCookieValue = 'this-is-a-fake-cookie-value'
  const mitigateResponse = {
    mitigated: false,
    setCookie: netaceaSetCookieValue
  }
  const originResponse = new fetch.Response()
  originResponse.status = 200

  const randomCookieValues = [
    randomString(),
    randomString(),
    randomString(),
    randomString()
  ]

  randomCookieValues.forEach(value => {
    originResponse.headers.append('set-cookie', value)
  })
  t.plan(globalAssertionCount + 5)
  const request = new fetch.Request(new URL('http://fake-address.com'))
  const responses = {
    mitigateResponse,
    originResponse
  }
  runTest(t, responses, (response, servicesCalled) => {
    t.equals(response.status, 200, 'Expects response status to be 200')
    const cookiesToCheck = [...randomCookieValues, netaceaSetCookieValue]
    const responseCookieString = response.headers.get('set-cookie')
    t.ok(cookiesToCheck.every(value => {
      return  responseCookieString.indexOf(value) > -1
    }), 'Expects all origin cookies and Netacea cookie to be returned with response')
    t.ok(servicesCalled.mitigateCalled, 'Expects mitigate to be called')
    t.ok(servicesCalled.originCalled, 'Expects origin to be called')
    t.ok(servicesCalled.logRequestCalled, 'Expects logRequest to be called')
  }, request)
})

test('Initial Request :: Request Blocked by Netacea', t => {
  const netaceaSetCookieValue = 'this-is-a-fake-cookie-value'
  const mitigationServiceResponse = new fetch.Response()
  mitigationServiceResponse.headers.set('set-cookie', netaceaSetCookieValue)
  const mitigateResponse = {
    mitigated: true,
    setCookie: netaceaSetCookieValue,
    response: mitigationServiceResponse
  }
  const originResponse = new fetch.Response()
  originResponse.status = 200

  const randomCookieValues = [
    randomString(),
    randomString(),
    randomString(),
    randomString()
  ]

  randomCookieValues.forEach(value => {
    originResponse.headers.append('set-cookie', value)
  })

  t.plan(globalAssertionCount + 5)
  const request = new fetch.Request(new URL('http://fake-address.com'))
  const responses = {
    mitigateResponse,
    originResponse,
    mitigationApplied: ''
  }
  runTest(t, responses, (response, servicesCalled) => {
    t.equals(response.status, 200, 'Expects response status to be 200')
    const responseCookieString = response.headers.get('set-cookie')
    t.ok(servicesCalled.mitigateCalled, 'Expects mitigate to be called')
    t.notOk(servicesCalled.originCalled, 'Expects origin not to be called')
    t.ok(servicesCalled.logRequestCalled, 'Expects logRequest to be called')
    t.equals(responseCookieString, netaceaSetCookieValue, 'Expects response cookies to only contain Netacea cookie')
  }, request)
})

test('Initial Request :: Request Served Captcha by Netacea', t => {
  const netaceaSetCookieValue = 'this-is-a-fake-cookie-value'
  const captchaBodyText = randomString()
  const mitigationServiceResponse = new fetch.Response(captchaBodyText)
  mitigationServiceResponse.headers.set('set-cookie', netaceaSetCookieValue)
  const mitigateResponse = {
    mitigated: true,
    setCookie: netaceaSetCookieValue,
    response: mitigationServiceResponse
  }
  const originResponse = new fetch.Response()
  originResponse.status = 200

  const randomCookieValues = [
    randomString(),
    randomString(),
    randomString(),
    randomString()
  ]

  randomCookieValues.forEach(value => {
    originResponse.headers.append('set-cookie', value)
  })

  t.plan(globalAssertionCount + 6)
  const request = new fetch.Request(new URL('http://fake-address.com'))
  const responses = {
    mitigateResponse,
    originResponse,
    mitigationApplied: ''
  }
  runTest(t, responses, (response, servicesCalled) => {
    t.equals(response.status, 200, 'Expects response status to be 200')
    const responseCookieString = response.headers.get('set-cookie')
    t.ok(servicesCalled.mitigateCalled, 'Expects mitigate to be called')
    t.notOk(servicesCalled.originCalled, 'Expects origin not to be called')
    t.ok(servicesCalled.logRequestCalled, 'Expects logRequest to be called')
    t.equals(responseCookieString, netaceaSetCookieValue, 'Expects response cookies to only contain Netacea cookie')
    t.deepEquals(response.body, Buffer.from(captchaBodyText), 'Expects body buffers to be the same')
  }, request)
})

test('Netacea OTP Request :: Origin response headers ', t => {
  const mitigateResponse = {
    mitigated: false,
    setCookie: null
  }
  const originResponse = new fetch.Response()
  originResponse.status = 200
  const randomCookieValues = [
    randomString(),
    randomString(),
    randomString(),
    randomString()
  ]
  randomCookieValues.forEach(value => {
    originResponse.headers.append('set-cookie', value)
  })
  t.plan(globalAssertionCount + 2)
  const request = new fetch.Request(new URL('http://fake-address.com'))
  runTest(t, {
    mitigateResponse,
    originResponse
  }, (response) => {
    t.equals(response.status, 200, 'Expects response status to be 200')
    const responseCookieString = response.headers.get('set-cookie')
    t.ok(randomCookieValues.every(value => {
      return  responseCookieString.indexOf(value) > -1
    }), 'Expects all origin cookies returned with response')
  }, request)
})

