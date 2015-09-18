# webcheck-to-string
Converts a [webcheck](https://github.com/atd-schubert/node-webcheck) buffer into a string if possible

## How to install

```bash
npm install --save webcheck-to-string
```

## How to use

```js
var Webcheck = require('webcheck');
var ToStringPlugin = require('webcheck-to-string');

var plugin = ToStringPlugin();

var webcheck = new Webcheck();
webcheck.addPlugin(plugin);

plugin.enable();

// now continue with your code...

webcheck.on('result', function (result) {
    result.getString(function (err, str) {
        if (err) {
            return console.error(err);
        }

        // Now you are able to handle your string.

    });
});

```

## Options

- `filterUrl`: Filter urls that should serve a getString (default all urls).
- `filterStatusCode`: Filter HTTP status code (default all).
- `filterContentType`: Filter allowed content type (defaults to text, html and xml).

### Note for filters

Filters are regular expressions, but the plugin uses only the `.test(str)` method to proof. You are able to write
your own and much complexer functions by writing the logic in the test method of an object like this:

```js
opts = {
   filterSomething: {
       test: function (val) {
           return false || true;
       }
   }
}
```
