** _This Project is no longer being maintained, I would recommend not using it unless you're looking to take ownership._ **



# depstat
___
find all calls to `require()` or `import()` from the command line and tells how many times a module has been referenced in the js file(s)

Note:

** _This Project is not in development._ **

** _any dev interested in taking over this project, contact me._ **

__searching for es6 modules will only work with jspm as the module loader__
___
### Install
```sh
$: npm install -g depstat
```
### Usage
_from your **project's root folder**_:
``` sh
$:~/Project$ depstat
```
_depstat will assume the source directory is located at `./src/` and package.json is located at `.`_:

_but this can be changed with options:_
``` sh
$:~/Project$ depstat --path [path to src files] --dep [path to package.json]
```
## example 1
##### with CommonJS loader

~/Project/package.json:
```json
{
  [...]
  "dependencies": {
    "array-flatten": "^2.1.0",
    "colors": "^1.1.2",
    "minimatch": "^3.0.3",
  }
}
```
~/Project/src/foo.js:
``` js
const colors = require('colors');
const flatten = require('array-flatten');
const minimatch = require('minimatch');
```

_then from the command line inside of your **project's root folder**_:
``` sh
$:~/Project$ depstat
```
_depstat automatically searches **the src/** folder in your project's root_

_the result_:
``` sh
times ref.      dep name                                           format    
___________________________________________________________________________
1               colors                                             CommonJS  
___________________________________________________________________________
1               array-flatten                                      CommonJS  
___________________________________________________________________________
1               minimatch                                          CommonJS  
```

## example 2
##### with es6 loader - jspm

~/Project/package.json:
```json
"jspm": {
    "directories": {
      "doc": "doc",
      "test": "test"
    },
    "dependencies": {
       "array-flatten": "^2.1.0",
       "colors": "^1.1.2",
       "minimatch": "^3.0.3",
    },
    "devDependencies": {}
  },
```
~/Project/src/foo.js:
``` js
import colors from 'colors';
import flatten from 'array-flatten';
import minimatch from 'minimatch';
```

_then from the command line_:
``` sh
$:~/www/client1/Project$ depstat --es6
```
_depstat automatically searches the src/ folder in your project's root_

_the result_:
``` sh
times ref.      dep name                                           format    
___________________________________________________________________________
1               colors                                             es6  
___________________________________________________________________________
1               array-flatten                                      es6  
___________________________________________________________________________
1               minimatch                                          es6  
```
