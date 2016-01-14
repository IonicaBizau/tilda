[![clp](http://i.imgur.com/Gcn3nvW.png)](#)

# clp [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![Version](https://img.shields.io/npm/v/clp.svg)](https://www.npmjs.com/package/clp) [![Downloads](https://img.shields.io/npm/dt/clp.svg)](https://www.npmjs.com/package/clp) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> A tiny and fast command line arguments parser and help generator.

## Installation

```sh
$ npm i --save clp
```

## Example

```js
#!/usr/bin/env node

// Dependencies
var Clp = require("clp");

// Create options and add them
var nameOption = new Clp.Option(["name", "n"], "Someone's name", "name", "Alice")
  , ageOption = new Clp.Option(["age", "a"], "Someone's age", "age")
  ;

// Create a new parser
var parser = new Clp({
    name: "Name Age"
  , version: "v1.0"
  , process: false
  , exe: "name-age"
  , examples: "name-age -a 10 --name Bob"
  , docs_url: "https://github.com/IonicaBizau/node-clp"
  , notes: "These are some final notes."
}, [nameOption, ageOption]);

parser.addExample("name-age -a 5 # will default the name to \"Alice\"");

parser.process();

// Validate the age
if (isNaN(parseInt(ageOption.value)) || ageOption.value < 0) {
    return console.error("Invalid age.");
}

// Validate the name
if (!nameOption.value) {
    return console.error("Invalid name.");
}

// Use the values
console.log(nameOption.value + " is " + ageOption.value + " year old.");
```

## Documentation

### `CLP.Option(aliases, description, name, def)`
Creates a new `CLPOption` instance.

Usages:

```js
CLP.Option(["age", "a"], "The age value.", "age", 20);
CLP.Option("age", "The age value.", "age", 20);
CLP.Option({
    aliases: ["age", "a"]
  , description: "The age value."
  , name: "age"
  , def: 20
  , handler: function (opt) {
       // Do something with opt
    }
});
```

#### Params
- **Array|Object** `aliases`: An array of strings representing the aliases  (e.g. `["name", "n"]`), a string representing a single alias (e.g. `"name"`)
 or an object containing the following fields:

 - `aliases` (Array): An array of strings representing the
    aliases (e.g. `["name", "n"]`)
 - `def` (Anything): The default value.
 - `description` (String): The option description.
 - `name` (String): The option name. If provided, the parser will expect a value otherwise
   will return or display an error.
 - `handler` (Function): The option handler which will be called when the
   option is found in the arguments. The first parameter is the option
   object and the scope is the `CLP` instance.
- **String** `description`: The option description.
- **String** `name`: The option name.
- **Anything** `def`: The default value.

#### Return
- **CLPOption** An object containing the following fields:
 - `aliases` (Array): An array of strings containing the computed aliases,
    the single letter being the first ones (e.g. `["-n", "--name"]`).
 - `value` (null|String|DefaultValue): The option value which was found
    after processing the arguments.
 - `def` (Anything): The provided default value.
 - `description` (String): The option description.
 - `name` (String): The option name.
 - `is_provided` (Boolean): A flag if the option was or not been provided.

### `CLP(args, options, clpOptions)`
Creates a new `CLP` (command line parser) instance.

Usage

```js
var parser = new CLP(); // will take the arguments from `process.argv`
var parser = new CLP(args); // default options, empty clpOptions
var parser = new CLP(options, clpOptions); // default arguments
var parser = new CLP(args, clpOptions); // default options
var parser = new CLP(args, options, clpOptions); // pass everything
var parser = new CLP("some command", ...); // pass a command string instead of arguments
```

#### Params
- **Array|String** `args`: An array of strings with the arguments or the command itself.
- **Object** `options`: An object containing the following fields:
 - `allow_exit` (Boolean): A flag to allow exit or not (e.g. when `-h`
   is passed). This is useful when *CLP* is used in executable scripts,
   however, when you only want to parse an array you should turn this
   off (default: `true`).
 - `help_opt` (Boolean): A flag to add the help option (default: `true`).
 - `version_opt` (Boolean): A flag to add the version option (default: `true`).
 - `name` (String): The application name (default: `"No Name"`).
 - `exe` (String): The executable name (default: `"no-name"`).
 - `version` (String): The application version (default: `"No Version"`).
 - `process` (Boolean): A flag to process the CLP options imediatelly (default: `false`).
 - `docs_url` (String): The documentation url (default: `""`).
 - `notes` (String): Final notes placed between examples and documentation
   url in help content (default: `""`).
 - `examples` (String|Array): A string or an array of string containing examples.
- **Array** `clpOptions`:

#### Return
- **CLP** The `CLP` instance.

### `addHelpOption(args, desc)`
Adds the help option.

#### Params
- **Array** `args`: Optional alias options for the help option (default: `["h", "help"]`).
- **String** `desc`: The help description (default: `"Displays this help."`).

#### Return
- **CLP** The `CLP` instance.

### `addVersionOption(args, desc)`
Adds the help option.

#### Params
- **Array** `args`: Optional alias options for the version option (default: `["h", "help"]`).
- **String** `desc`: The version description (default: `"Displays version information."`).

#### Return
- **CLP** The `CLP` instance.

### `addOption(opt)`
Adds a new option to parse.

#### Params
- **CLPOption** `opt`: The `CLPOption` value to add.

#### Return
- **CLP** The `CLP` instance.

### `addExample(example)`
Adds a new example.

#### Params
- **String** `example`: The example to add.

#### Return
- **CLP** The `CLP` instance.

### `process()`
Processes the arguments and adds the values in the options.

#### Return
- **Object** An object containing the following fields:
 - `error` (Error|null): An error that appeared during the arguments parsing.
 - `_` (Array): An array of strings representing the values which are not options, nor values, but other arguments (e.g. `some-tool --foo bar other arguments`).

### `error(err_code, fields)`
Creates an error by getting the error code and the error fields.

#### Params
- **String** `err_code`: The error code.
- **Object** `fields`: An object with the error fields.

#### Return
- **Error** The error which was built.

### `displayHelp()`
Generates the help content and returns it.

#### Return
- **String** The help information.

### `displayVersion()`
Returns the version information.

#### Return
- **String** The version information.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

 - [`a-csv`](https://github.com/jillix/a-csv) by jillix

 - [`birthday`](https://github.com/IonicaBizau/birthday)

 - [`blah`](https://github.com/IonicaBizau/blah)

 - [`cdnjs-importer`](https://github.com/cdnjs/cdnjs-importer)

 - [`cli-gh-cal`](https://github.com/IonicaBizau/cli-gh-cal)

 - [`diable`](https://github.com/IonicaBizau/diable)

 - [`engine-tools`](https://github.com/jillix/engine-tools) by jillix

 - [`gh-notifier`](https://bitbucket.org/IonicaBizau/gh-notifier#readme)

 - [`ghcal`](https://github.com/IonicaBizau/ghcal)

 - [`git-issues`](https://github.com/softwarescales/git-issues) by Gabriel Petrovay

 - [`git-stats`](https://github.com/IonicaBizau/git-stats)

 - [`git-stats-importer`](https://github.com/IonicaBizau/git-stats-importer)

 - [`github-emojify`](https://github.com/IonicaBizau/github-emojifiy#readme)

 - [`github-labeller`](https://github.com/IonicaBizau/github-labeller#readme)

 - [`github-stats`](https://github.com/IonicaBizau/github-stats)

 - [`gpm`](https://github.com/IonicaBizau/gpm)

 - [`kindly-license`](https://github.com/IonicaBizau/kindly-license)

 - [`name-it`](https://github.com/IonicaBizau/name-it#readme)

 - [`namly`](https://github.com/IonicaBizau/namly#readme)

 - [`namy`](https://github.com/IonicaBizau/namy)

 - [`npmreserve`](https://github.com/IonicaBizau/npmreserve)

 - [`ssh-remote`](https://github.com/IonicaBizau/ssh-remote)

 - [`statique`](https://github.com/IonicaBizau/node-statique)

 - [`tinyreq`](https://github.com/IonicaBizau/tinyreq)

 - [`tithe`](https://github.com/IonicaBizau/tithe)

 - [`web-term`](https://github.com/IonicaBizau/web-term)

 - [`wrabbit`](https://github.com/jillix/wrabbit) by jillix

## License

[MIT][license] © [Ionică Bizău][website]

[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2015#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md