# log2json2stdout

[![Build Status](https://img.shields.io/travis/fanatid/log2json2stdout.svg?branch=master&style=flat-square)](https://travis-ci.org/fanatid/log2json2stdout)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

  - [What this is it?](#what-this-is-it)
  - [Installation](#installation)
  - [Examples](#examples)
    - [Output example](#output-example)
    - [Add new log levels](#add-new-log-levels)
    - [Use verbosity instead levels](#use-verbosity-instead-levels)
    - [Logging error objects](#logging-error-objects)
  - [LICENSE](#license)

## What this is it?

This is simple logger for JavaScript programs.

- All logs going to stdout, because apps is not a place where logs should be processed.
- Output in JSON, because it's really easy to parse (except TTY, where output is human readable).
- Fields in JSON object in order: `timestamp`, `level`, `message`, `...rest`.
- By default, only 2 levels exported: `info` & `error`. You can add own levels, but are we care about other levels in real life?

All this items makes this package perfect for applications in containers.

## Installation

[npm](https://www.npmjs.com/):

```bash
npm install https://github.com/fanatid/log2json2stdout
```

[yarn](https://yarnpkg.com/):

```bash
yarn add https://github.com/fanatid/log2json2stdout
```

By default `npm` / `yarn` will install code from `master` branch. If you want specified version, just add some branch name / commit hash / tag and the end of URL. See [Yarn add](https://yarnpkg.com/lang/en/docs/cli/add/) or [npm install](https://docs.npmjs.com/cli/install) for details about installing package from git repo.

## Examples

#### Output example

`example.js`:
```js
const logger = require('log2json2stdout')

logger.info('hello')

const err = new Error('world')
logger.error({ message: err.message, stack: err.stack })
```

```bash
$ # human-readable output, because output to TTY
$ node example.js
2019-07-10T19:51:23.824Z info: hello
2019-07-10T19:51:23.826Z error: world
Error: world
    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/example.js:5:13)
    at Module._compile (internal/modules/cjs/loader.js:776:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:787:10)
    at Module.load (internal/modules/cjs/loader.js:643:32)
    at Function.Module._load (internal/modules/cjs/loader.js:556:12)
    at Function.Module.runMain (internal/modules/cjs/loader.js:839:10)
    at internal/main/run_main_module.js:17:11
$ # hack for JSON output (STDOUT is not considered as TTY with tee)
$ node example.js | tee
{"timestamp":"2019-07-10T19:54:07.539Z","level":"info","message":"hello"}
{"timestamp":"2019-07-10T19:54:07.540Z","level":"error","message":"world","stack":"Error: world\n    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/example.js:5:13)\n    at Module._compile (internal/modules/cjs/loader.js:776:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:787:10)\n    at Module.load (internal/modules/cjs/loader.js:643:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:556:12)\n    at Function.Module.runMain (internal/modules/cjs/loader.js:839:10)\n    at internal/main/run_main_module.js:17:11"}
$ # JSON output can be converted to human-readable with log2json2stdout2tty
$ node example.js | tee | log2json2stdout2tty
2019-07-10T19:51:23.824Z info: hello
2019-07-10T19:51:23.826Z error: world
Error: world
    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/example.js:5:13)
    at Module._compile (internal/modules/cjs/loader.js:776:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:787:10)
    at Module.load (internal/modules/cjs/loader.js:643:32)
    at Function.Module._load (internal/modules/cjs/loader.js:556:12)
    at Function.Module.runMain (internal/modules/cjs/loader.js:839:10)
    at internal/main/run_main_module.js:17:11
```

#### Add new log levels

If you still want use more levels than `info` / `error`, you can add new functional in your own project:

```js
const logger = require('log2json2stdout')

logger.emerg = (obj) => logger('emerg', obj)
logger.alert = (obj) => logger('alert', obj)
logger.crit = (obj) => logger('crit', obj)
// logger.error = (obj) => logger('error', obj) <-- already exists
logger.warning = (obj) => logger('warning', obj)
logger.notice = (obj) => logger('notice', obj)
// logger.info = (obj) => logger('info', obj) <-- already exists
logger.debug = (obj) => logger('debug', obj)
```

and if you want add colors for levels in TTY, you should change `ttyGetColoredLevel`:

```js
logger.ttyGetColoredLevel = (level) => {
  switch (level) {
    case 'emerg':
    case 'alert':
    case 'crit':
      return logger.chalk.red.bold(level)

    case 'error':
      return logger.chalk.red(level)

    case 'warning':
    case 'notice':
      return logger.chalk.yellow(level)

    case 'info':
      return logger.chalk.green(level)

    default: return level
  }
}
```

#### Use verbosity instead levels

In comprasion to more log levels (or to additional), we can use similar idea which used in [debug](https://github.com/visionmedia/debug). Logging will depends from CLI flags / ENV vars:

```js
const logger = require('log2json2stdout')

const namespaces = Object.create(null)
logger.create = (namespace) => {
  if (!namespaces[namespace]) {
    function newLogger (...args) {
      newLogger.log(...args)
    }
    Object.assign(newLogger, logger)
    if (!process.env[`MYAPP_LOG_${namespace}`]) newLogger.log = () => {}

    namespaces[namespace] = newLogger
  }

  return namespaces[namespace]
}

// and now create logger for specified namespace
const loggerThingX = logger.create('THING_X')
loggerThingX.info('log info event from thing x')
```

So, now if we defined ENV `MYAPP_LOG_THING_X` we will see log message, if not defined there will no logs about `THING_X`.

In addition, if we want see how much time has passed from last message we can modify `logObj` function:

```js
const prettyMs = require('pretty-ms')

function diffTime (time) {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return prettyMs(diff[0] * 1e3 + diff[1] / 1e6)
}


// logObj = newLogger.logObj
// let ts = null
// newLogger.logObj = (obj) => {
//   if (ts === null) ts = diffTime()
//   else obj.message = `${obj.message} +${diffTime(time)}`
//   logObj(obj)
// }
```

#### Logging error objects

Sometimes errors do not have nice messages and it would be good log them in little different way than just string.

```js
logger.errorObj = (message, err) => {
  const obj = { message }

  for (const name of Object.getOwnPropertyNames(err)) {
    switch (name) {
      // do not rewrite message
      case 'message':
        obj.errmsg = err.message
        break

      default:
        obj[name] = err[name]
        break
    }
  }

  logger.error(obj)
}

// } catch (err) {
//   logger.errorObj(`new error at block X: ${err.message.toUpperCase()}`, err)
// }
```

## LICENSE [MIT](LICENSE)
