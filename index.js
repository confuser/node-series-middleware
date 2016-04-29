var asyncUntil = require('async/until')

module.exports = function () {
  // Help prevent deoptimisation under some engines such as V8
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
  var middlewares = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))
    , totalMiddleware = middlewares.length

  // It could be simplified with async.series BUT
  // we need to avoid any leaks caused by unexecuted callbacks waiting forever
  return function (req, res, next) {
    var currentMiddleware = 0
      , responseSent = false

    asyncUntil(function () {
      return responseSent || currentMiddleware === totalMiddleware
    }, function (callback) {
      var middleware = middlewares[currentMiddleware]

      currentMiddleware++

      // Attaches listener multiple times
      res.on('finish', function () {
        // Avoid callbacks being executed multiple times
        if (!responseSent) {
          responseSent = true

          callback()
        }
      })

      // Whilst express will catch this, we need to explicitly catch
      // to avoid leaving the process in an undesirable state
      // Downside: causes deopt :(
      try {
        middleware(req, res, callback)
      } catch (error) {
        callback(error)
      }
    }, function (error) {
      if (error) return next(error)
      if (!responseSent) return next()
    })

  }

}
