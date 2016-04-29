# series-middleware

[![Build Status](https://travis-ci.org/confuser/node-series-middleware.png?branch=master)](https://travis-ci.org/confuser/node-series-middleware)
[![Coverage Status](https://coveralls.io/repos/confuser/node-series-middleware/badge.png?branch=master)](https://coveralls.io/r/confuser/node-series-middleware?branch=master)

Execute middleware in series. Useful for frameworks/systems that will only accept a singular `function (req, res, next)`. Written in a way to minimise leaks.

## Installation
```
npm install series-middleware --save
```

## Usage
```js

var app = require('express')()
  , seriesMiddleware = require('series-middleware')

// Express supports this natively obviously, but configuration based frameworks such as a127-magic, do not
app.get('/test', seriesMiddleware(noOpMiddleware, noOpMiddleware), function (req, res) {
  res.send('I am OK')
})

app.get('/test2', seriesMiddleware(function (req, res) {
  res.send('I am OK')
}, noOpMiddleware), function (req, res) {
  res.send('Never Executed')
})

```
