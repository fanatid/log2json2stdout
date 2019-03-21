# log2json2stdout

[![NPM Package](https://img.shields.io/npm/v/log2json2stdout.svg?style=flat-square)](https://www.npmjs.org/package/log2json2stdout) [![Build Status](https://img.shields.io/travis/fanatid/log2json2stdout.svg?branch=master&style=flat-square)](https://travis-ci.org/fanatid/log2json2stdout)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

This is simple logger for JavaScript programs.

- Support only 2 levels: `info` & `error` because nobody in reality do not care about other levels.
- All logs going to stdout, because apps is not a place where logs should be processed.
- Output in JSON, because it's really easy to parse (except TTY, where output is human readable).
- Fields in JSON object in order: `timestamp`, `level`, `message`, ...rest

## Usage

```bash
$ node ./test.js
{"timestamp":"2019-03-21T16:58:16.440Z","level":"info","message":"hello"}
{"timestamp":"2019-03-21T16:58:16.442Z","level":"error","message":"world","stack":"Error: world\n    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/test.js:5:13)\n    at Module._compile (internal/modules/cjs/loader.js:799:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:810:10)\n    at Module.load (internal/modules/cjs/loader.js:666:32)\n    at tryModuleLoad (internal/modules/cjs/loader.js:606:12)\n    at Function.Module._load (internal/modules/cjs/loader.js:598:3)\n    at Function.Module.runMain (internal/modules/cjs/loader.js:862:12)\n    at internal/main/run_main_module.js:21:11"}
$ node ./test.js | tee
2019-03-21T16:58:10.411Z info: hello
2019-03-21T16:58:10.413Z error: world
Error: world
    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/test.js:5:13)
    at Module._compile (internal/modules/cjs/loader.js:799:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:810:10)
    at Module.load (internal/modules/cjs/loader.js:666:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:606:12)
    at Function.Module._load (internal/modules/cjs/loader.js:598:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:862:12)
    at internal/main/run_main_module.js:21:11
$ node ./test.js | log2json2stdout-to-tty
2019-03-21T17:03:30.838Z info: hello
2019-03-21T17:03:30.840Z error: world
Error: world
    at Object.<anonymous> (/home/kirill/projects/log2json2stdout/test.js:5:13)
    at Module._compile (internal/modules/cjs/loader.js:799:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:810:10)
    at Module.load (internal/modules/cjs/loader.js:666:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:606:12)
    at Function.Module._load (internal/modules/cjs/loader.js:598:3)
    at Function.Module.runMain (internal/modules/cjs/loader.js:862:12)
    at internal/main/run_main_module.js:21:11
$ cat test.js
const logger = require('log2json2stdout')

logger.info('hello')

const err = new Error('world')
logger.error({ message: err.message, stack: err.stack })
```

## LICENSE

This library is free and open-source software released under the MIT license.
