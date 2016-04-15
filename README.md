[![tilda](http://i.imgur.com/kLOhs5t.png)](#)

# tilda [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![Version](https://img.shields.io/npm/v/tilda.svg)](https://www.npmjs.com/package/tilda) [![Downloads](https://img.shields.io/npm/dt/tilda.svg)](https://www.npmjs.com/package/tilda) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> Tiny module for building command line tools.

## :cloud: Installation
    
```sh
$ npm i --save tilda
```

            
## :clipboard: Example

        

```js
#!/usr/bin/env node

// ./index.js -f tux 'Hello World!'
//  ______________
// < Hello World! >
//  --------------
//    \
//     \
//         .--.
//        |o_o |
//        |:_/ |
//       //   \ \
//      (|     | )
//     /'\_   _/`\
//     \___)=(___/
//
// Help output
// -----------
//
// ./index.js --help
// Usage: cowsay <command> <text> [options]
//
// Configurable speaking cow (and a bit more)
//
// Commands:
//   list  List the cow templates.
//
// Options:
//   -e, --eye <str>      The eye string.
//   -T, --tongue <str>   The tongue string.
//   -f, --cowfile <cow>  The cowfile.
//   -v, --version        Displays version information.
//   -h, --help           Displays this help.
//
// Examples:
//   $ cowsay 'Hello there!'
//   $ cowsay -e '*-' 'Heyyy!
//   $ cowsay -T '++' 'I have a nice tongue!
//
// Well, this is just a tiny example how to use Tilda.
// Documentation can be found at https://github.com/IonicaBizau/tilda.

"use strict";

const Tilda = require("tilda")
    , cowsay = require("cowsay")
    ;

let p = new Tilda({
    name: "cowsay"
  , version: "1.0.0"
  , description: "Configurable speaking cow (and a bit more)"
  , documentation: "https://github.com/IonicaBizau/tilda"
  , examples: [
        "cowsay 'Hello there!'"
      , "cowsay -e '*-' 'Heyyy!"
      , "cowsay -T '++' 'I have a nice tongue!"
    ]
  , notes: "Well, this is just a tiny example how to use Tilda."
  , args: ["text"]
}).option([
    {
        opts: ["eye", "e"]
      , desc: "The eye string."
      , name: "str"
    }
  , {
        opts: ["tongue", "T"]
      , desc: "The tongue string."
      , name: "str"
    }
  , {
        opts: ["cowfile", "f"]
      , desc: "The cowfile."
      , name: "cow"
      , default: "default"
    }
]).action([
    {
        name: "list"
      , desc: "List the cow templates."
      , options: [
            {
                opts: ["list", "l"],
                desc: "Display as list",
            }
        ]
    }
]).on("list", action => {
    cowsay.list((err, list) => {
        if (err) { return this.exit(err); }
        let str = list.join(action.options.list.is_provided ? "\n" : ", ")
        console.log(str);
    });
}).main(action => {
    console.log(cowsay.say({
        text: action.args.text
      , e: action.options.eye.value
      , T: action.options.tongue.value
      , f: action.options.cowfile.value
    }));
});
```
    
## :memo: Documentation
        
### `TildaOption(input)`
The `TildaOption` class used for creating option objects.

#### Params
- **Object** `input`: An object containing the following fields:
 - `name` (String): The option name (optional).
 - `description` (String): The option description.
 - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
 - `default` (Anything): The default value.
 - `handler` (Function): The option handler which will be called when the
   option is found in the arguments. The first parameter is the option
   object and the second argument is the action where the option belongs to.
 - `required` (Boolean): A flag representing if the option is mandatory or not (default: `false`).
 - `type` (Class|String): The type class (e.g. `String`) or its stringified representation (e.g. `"string"`).

#### Return
- **TildaOption** The `TildaOption` instance.
 - `description` (String): The option description.
 - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
 - `aliases` (Array): An array of strings containing the computed aliases,
    the single letter ones being the first (e.g. `["-n", "--name"]`).
 - `value` (null|String|DefaultValue): The option value which was found
    after processing the arguments.
 - `def` (Anything): The provided default value.
 - `is_provided` (Boolean): A flag if the option was or not been provided.
 - `handler` (Function): The handler function.
 - `required` (Boolean): The required value.
 - `type` (Class|String): The option value type.

### `TildaAction(info, options)`
The `TildaAction` class used for creating action objects.

This is extended `EventEmitter`.

#### Params
- **String|Object** `info`: The path to a containing the needed information or an object containing:
 - `description|desc` (String): The action description.
 - `name` (String): The action name.
 - `bin` (Object): A `package.json`-like `bin` field (optional).
 - `args` (Array): An array of strings representing the action argument names (default: `[]`).
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.
- **Object** `options`: An object containing the following fields (if provided, they have priority over the `info` object):

 - `args` (Array): An array of strings representing the action argument names (default: `[]`).
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.

#### Return
- **TildaAction** The `TildaAction` instance containing:
 - `options` (Object): The action options.
 - `description` (String): The action description.
 - `name` (String): The action name.
 - `uniqueOpts` (Array): An array of unique options in order.
 - `argNames` (Array): The action arguments.
 - `args` (Object): The arguments' values.
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.

### `option(input)`
Adds one or more options to the action object.

#### Params
- **Array|Object** `input`: An array of option objects or an object passed to the `TildaOption` class.

### `Tilda(info, options)`
Creates the parser instance.

#### Params
- **Object** `info`: The `info` object passed to `TildaAction`.
- **Object** `options`: The `options` passed to `TildaAction`, extended with:
 - `defaultOptions` (Array): Default and global options (default: help and version options).
 - `argv` (Array): A cutom array of arguments to parse (default: process arguments).

#### Return
- **Tilda** The `Tilda` instance containing:
 - `actions` (Object): An object containing the action objects.
 - `version` (String): The version (used in help and version outputs).
 - `argv` (Array): Array of arguments to parse.
 - `_globalOptions` (Array): The global options, appended to all the actions.
 - `actionNames` (Array): Action names in order.

### `globalOption(input)`
Adds a global option for all the actions.

#### Params
- **Array|Object** `input`: The option object.

### `action(input, opts)`
Adds a new action.

#### Params
- **Object** `input`: The info object passed to `TildaAction`.
- **Array** `opts`: The action options.

### `exit(msg, code)`
Exits the process.

#### Params
- **String|Object** `msg`: The stringified message or an object containing the error code.
- **Number** `code`: The exit code (default: `0`).

### `parse()`
Parses the arguments. This is called internally.

This emits the action names as events.

### `displayVersion()`
Returns the version information.

#### Return
- **String** The version information.

### `displayHelp(action)`
Displays the help output.

#### Params
- **TildaAction** `action`: The action you want to display help for.

### `main(cb)`
Append a handler when the main action is used.

#### Params
- **Function** `cb`: The callback function.

### `convertTo(classConst, input, opts)`
Converts an input into a class instance.

#### Params
- **Class** `classConst`: The class to convert to.
- **Object|Array** `input`: The object info.
- **Object** `opts`: The options object (optional).

#### Return
- **TildaAction|TildaOption** The input converted into a class instance.

        
## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## :dizzy: Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

 - [`web-term`](https://github.com/IonicaBizau/web-term)—A full screen terminal in your browser.
## :scroll: License
    
[MIT][license] © [Ionică Bizău][website]
    
[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2015#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md