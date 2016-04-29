var assert = require('assert')
  , supertest = require('supertest')
  , express = require('express')
  , seriesMiddleware = require('../')

describe('Series Middleware', function () {

  it('should execute all middleware', function (done) {
    var app = express()
      , middlewareCalled = 0
      , middleware = function (req, res, next) {
          middlewareCalled++

          next()
        }

    app.get('/test', seriesMiddleware(middleware, middleware, middleware), function (req, res) {
      assert.equal(middlewareCalled, 3)

      res.send('Foo')
    })

    supertest(app)
      .get('/test')
      .expect(200, 'Foo')
      .end(done)
  })

  it('should support one middleware', function (done) {
    var app = express()
      , middlewareCalled = 0
      , middleware = function (req, res, next) {
          middlewareCalled++

          next()
        }

    app.get('/test', seriesMiddleware(middleware), function () {
      assert.equal(middlewareCalled, 1)

      done()
    })

    supertest(app)
      .get('/test')
      .expect(200)
      .end(done)
  })

  it('should pass back any errors', function (done) {
    var app = express()
      , middlewareCalled = 0
      , middleware = function () {
          middlewareCalled++

          throw new Error('testing')
        }

    app.get('/test', seriesMiddleware(middleware, middleware, middleware), function () {
      done(new Error('Oops this should not have been called'))
    })

    supertest(app)
      .get('/test')
      .expect(500)
      .end(function (error, res) {
        if (error) return done(error)

        assert.equal(res.error.text.substring(0, 14), 'Error: testing')
        assert.equal(middlewareCalled, 1)

        done()
      })
  })

  it('should exit early if response handled', function (done) {
    var app = express()
      , middlewareCalled = 0
      , middleware = function (req, res, next) {
          middlewareCalled++

          if (middlewareCalled === 1) return res.send('Hello World')

          next(new Error('Oops this should not have been called'))
        }

    app.get('/test', seriesMiddleware(middleware, middleware, middleware), function () {
      done(new Error('Oops this should not have been called'))
    })

    supertest(app)
      .get('/test')
      .expect(200, 'Hello World')
      .end(function (error) {
        if (error) return done(error)

        assert.equal(middlewareCalled, 1)

        done()
      })
  })

})
