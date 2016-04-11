// Dependencies
var Ul = require("ul")
  , Errors = require("./errors")
  , Table = require("le-table")
  , AnsiParser = require("ansi-parser")
  ;

// Table defaults
Table.defaults.marks = {
    nw: "  "
  , n:  " "
  , ne: " "
  , e:  " "
  , se: " "
  , s:  " "
  , sw: " "
  , w:  "  "
  , b:  " "
  , mt: " "
  , ml: " "
  , mr: " "
  , mb: " "
  , mm: " "
};

/**
 * CLP.Option
 * Creates a new `CLPOption` instance.
 *
 * Usages:
 *
 * ```js
 * CLP.Option(["age", "a"], "The age value.", "age", 20);
 * CLP.Option("age", "The age value.", "age", 20);
 * CLP.Option({
 *     aliases: ["age", "a"]
 *   , description: "The age value."
 *   , name: "age"
 *   , def: 20
 *   , handler: function (opt) {
 *        // Do something with opt
 *     }
 * });
 * ```
 *
 * @name CLP.Option
 * @function
 * @param {Array|Object} aliases An array of strings representing the aliases
 *  (e.g. `["name", "n"]`), a string representing a single alias (e.g. `"name"`)
 *  or an object containing the following fields:
 *
 *  - `aliases` (Array): An array of strings representing the
 *     aliases (e.g. `["name", "n"]`)
 *  - `def` (Anything): The default value.
 *  - `description` (String): The option description.
 *  - `name` (String): The option name. If provided, the parser will expect a value otherwise
 *    will return or display an error.
 *  - `handler` (Function): The option handler which will be called when the
 *    option is found in the arguments. The first parameter is the option
 *    object and the scope is the `CLP` instance.
 *
 * @param {String} description The option description.
 * @param {String} name The option name.
 * @param {Anything} def The default value.
 * @return {CLPOption} An object containing the following fields:
 *
 *  - `aliases` (Array): An array of strings containing the computed aliases,
 *     the single letter being the first ones (e.g. `["-n", "--name"]`).
 *  - `value` (null|String|DefaultValue): The option value which was found
 *     after processing the arguments.
 *  - `def` (Anything): The provided default value.
 *  - `description` (String): The option description.
 *  - `name` (String): The option name.
 *  - `is_provided` (Boolean): A flag if the option was or not been provided.
 */

/**
 * CLP
 * Creates a new `CLP` (command line parser) instance.
 *
 * Usage
 *
 * ```js
 * var parser = new CLP(); // will take the arguments from `process.argv`
 * var parser = new CLP(args); // default options, empty clpOptions
 * var parser = new CLP(options, clpOptions); // default arguments
 * var parser = new CLP(args, clpOptions); // default options
 * var parser = new CLP(args, options, clpOptions); // pass everything
 * var parser = new CLP("some command", ...); // pass a command string instead of arguments
 * ```
 *
 * @name CLP
 * @function
 * @param {Array|String} args An array of strings with the arguments or the command itself.
 * @param {Object} options An object containing the following fields:
 *
 *  - `allow_exit` (Boolean): A flag to allow exit or not (e.g. when `-h`
 *    is passed). This is useful when *CLP* is used in executable scripts,
 *    however, when you only want to parse an array you should turn this
 *    off (default: `true`).
 *  - `help_opt` (Boolean): A flag to add the help option (default: `true`).
 *  - `version_opt` (Boolean): A flag to add the version option (default: `true`).
 *  - `name` (String): The application name (default: `"No Name"`).
 *  - `exe` (String): The executable name (default: `"no-name"`).
 *  - `version` (String): The application version (default: `"No Version"`).
 *  - `process` (Boolean): A flag to process the CLP options imediatelly (default: `false`).
 *  - `docs_url` (String): The documentation url (default: `""`).
 *  - `notes` (String): Final notes placed between examples and documentation
 *    url in help content (default: `""`).
 *  - `examples` (String|Array): A string or an array of string containing examples.
 *
 * @param {Array} clpOptions
 * @return {CLP} The `CLP` instance.
 */
function CLP(args, options, clpOptions) {

    var self = this;

    // Merge the defaults
    self.opts = Ul.merge(options, {
        allow_exit: true
      , help_opt: true
      , version_opt: true
      , name: "No Name"
      , exe: "no-name"
      , version: "No Version"
      , process: false
      , examples: []
      , notes: ""
      , docs_url: ""
    });

    // Attach the fields
    self.options = [];
    self.args = args;
    self._ = {};

    // Handle example strings
    if (typeof self.opts.examples === "string") {
        self.opts.examples = self.opts.examples.split("\n").map(function (c) {
            return c.trim();
        }).filter(function (c) {
            return c;
        });
    }

    // Add provided options
    clpOptions.forEach(self.addOption.bind(self));

    // Add the help option
    if (self.opts.help_opt) {
        self.addHelpOption();
    }

    // Add the version option
    if (self.opts.version_opt) {
        self.addVersionOption();
    }

    // Process the options
    if (self.opts.process) {
        self.process();
    }
}

/**
 * process
 * Processes the arguments and adds the values in the options.
 *
 * @name process
 * @function
 * @return {Object} An object containing the following fields:
 *
 *  - `error` (Error|null): An error that appeared during the arguments parsing.
 *  - `_` (Array): An array of strings representing the values which are not options, nor values, but other arguments (e.g. `some-tool --foo bar other arguments`).
 */

/**
 * error
 * Creates an error by getting the error code and the error fields.
 *
 * @name error
 * @function
 * @param {String} err_code The error code.
 * @param {Object} fields An object with the error fields.
 * @return {Error} The error which was built.
 */
CLP.prototype.error = function (err_code, fields) {
    var str = CLP.Errors[err_code];
    fields = fields || {};
    if (str === undefined) {
        throw new Error("Invalid error code: " + err_code);
    }
    Object.keys(fields).forEach(function (c) {
        str = str.replace(new RegExp("{" + c + "}", "g"), fields[c]);
    });
    return new Error(str);
};

/**
 * displayHelp
 * Generates the help content and returns it.
 *
 * @name displayHelp
 * @function
 * @return {String} The help information.
 */
CLP.prototype.displayHelp = function () {
    let opts = self.opts
      , options = self.options
      , helpTable = new Table({
            cell: {
                hAlign: "left"
            }
        })
      , str = "Usage: " + this.opts.exe + " [options]"
            + "\n\nOptions:\n"
      ;

    options.forEach(function (c) {
        var opt = c.aliases.join(", ");
        if (c.name) {
            opt += " <" + c.name + ">";
        }
        helpTable.addRow([opt, c.description.match(/.{1,50}(\s|$)|\S+?(\s|$)/g).join("\n")]);
    });

    str += AnsiParser.removeAnsi(helpTable.toString()).split("\n").filter(function (c) {
        return c.trim();
    }).join("\n") + "\n\n";

    if (opts.examples) {
        str += "Examples:\n  " + opts.examples.join("\n  ") + "\n\n";
    }

    if (opts.notes) {
        str += opts.notes + "\n\n";
    }

    if (opts.docs_url) {
        str += "Documentation can be found at " + opts.docs_url;
    }

    return str;
};

CLP.Option = Option;
CLP.Errors = Errors;
