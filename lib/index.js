"use strict";

const events = require("events")
    , ul = require("ul")
    , clp = require("clp")
    , iterateObject = require("iterate-object")
    , isUndefined = require("is-undefined")
    , deffy = require("deffy")
    , arrsToObj = require("arrs-to-obj")
    , errors = require("./errors")
    , Err = require("err")
    , Table = require("le-table")
    , isEmptyObj = require("is-empty-obj")
    , textWrap = require("wrap-text")
    , indento = require("indento")
    , removeEmptyLines = require("remove-blank-lines")
    , ansiParser = require("ansi-parser")
    , typpy = require("typpy")
    , rJson = require("r-json")
    ;

const TABLE_OPTIONS = {
    cell: {
        hAlign: "left"
    }
  , marks: {
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
    }
};

class TildaOption {
    /**
     * TildaOption
     * The `TildaOption` class used for creating option objects.
     *
     * @name TildaOption
     * @function
     * @param {Object} input An object containing the following fields:
     *
     *  - `name` (String): The option name (optional).
     *  - `description` (String): The option description.
     *  - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
     *  - `default` (Anything): The default value.
     *  - `handler` (Function): The option handler which will be called when the
     *    option is found in the arguments. The first parameter is the option
     *    object and the second argument is the action where the option belongs to.
     *  - `required` (Boolean): A flag representing if the option is mandatory or not (default: `false`).
     *  - `type` (Class|String): The type class (e.g. `String`) or its stringified representation (e.g. `"string"`).
     *
     * @returns {TildaOption} The `TildaOption` instance.
     *
     *  - `description` (String): The option description.
     *  - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
     *  - `aliases` (Array): An array of strings containing the computed aliases,
     *     the single letter ones being the first (e.g. `["-n", "--name"]`).
     *  - `value` (null|String|DefaultValue): The option value which was found
     *     after processing the arguments.
     *  - `def` (Anything): The provided default value.
     *  - `is_provided` (Boolean): A flag if the option was or not been provided.
     *  - `handler` (Function): The handler function.
     *  - `required` (Boolean): The required value.
     *  - `type` (Class|String): The option value type.
     */
    constructor (input) {
        this.name = input.name;
        this.description = input.description || input.desc;
        this.opts = input.opts;
        this.value = null;
        if (!isUndefined(input.default)) {
            this.value = this.default = input.default;
        }
        this.opts.sort(a => a.length === 1 ? -1 : 1);
        this.aliases = this.opts.map(c => {
            return (c.length === 1 ? "-" : "--") + c
        });
        this.is_provided = false;
        this.handler = input.handler;
        this.required = input.required || false;
        this.type = input.type;
    }
}

class TildaAction extends events.EventEmitter {

    /**
     * TildaAction
     * The `TildaAction` class used for creating action objects.
     *
     * This is extended `EventEmitter`.
     *
     * @name TildaAction
     * @function
     * @param {String|Object} info The path to a containing the needed information or an object containing:
     *
     *  - `description|desc` (String): The action description.
     *  - `name` (String): The action name.
     *  - `bin` (Object): A `package.json`-like `bin` field (optional).
     *  - `args` (Array): An array of strings representing the action argument names (default: `[]`).
     *  - `examples` (Array): An array of strings containing examples how to use the action.
     *  - `notes` (String): Additional notes to display in the help command.
     *  - `documentation` (String): Action-related documentation.
     *
     * @param {Object} options An object containing the following fields (if
     * provided, they have priority over the `info` object):
     *
     *  - `args` (Array): An array of strings representing the action argument names (default: `[]`).
     *  - `examples` (Array): An array of strings containing examples how to use the action.
     *  - `notes` (String): Additional notes to display in the help command.
     *  - `documentation` (String): Action-related documentation.
     *
     * @returns {TildaAction} The `TildaAction` instance containing:
     *
     *  - `options` (Object): The action options.
     *  - `description` (String): The action description.
     *  - `name` (String): The action name.
     *  - `uniqueOpts` (Array): An array of unique options in order.
     *  - `argNames` (Array): The action arguments.
     *  - `args` (Object): The arguments' values.
     *  - `examples` (Array): An array of strings containing examples how to use the action.
     *  - `notes` (String): Additional notes to display in the help command.
     *  - `documentation` (String): Action-related documentation.
     *
     */
    constructor (info, options) {
        if (typeof info === "string") {
            info = rJson(info);
        }
        super();
        options = options || {};
        this.options = {};
        this.description = info.description || info.desc;
        this.name = Object.keys(info.bin || {})[0] || info.name;
        this.uniqueOpts = [];
        this.argNames = options.args || info.args || [];
        this.args = {};
        this.examples = options.examples || info.examples || [];
        this.notes = options.notes || info.notes || "";
        this.documentation = options.documentation || info.documentation || "";
    }

    /**
     * option
     * Adds one or more options to the action object.
     *
     * @name option
     * @function
     * @param {Array|Object} input An array of option objects or an object
     * passed to the `TildaOption` class.
     */
    option (input) {
        if (!input) { return; }
        if (Array.isArray(input)) {
            input.forEach(c => this.option(c));
            return this;
        }

        if (!Array.isArray(input.opts)) {
            throw new Error("The opts array is mandatory.");
        }

        let opt = new TildaOption(input);
        opt.opts.forEach(c => {
            if (this.options[c]) {
                throw new Error(`Found duplicated option: ${c}. The option names should be unique.`);
            }
            this.options[c] = opt;
        });
        this.uniqueOpts.push(opt);
        return this;
    }
}

module.exports = class Tilda extends TildaAction {

    /**
     * Tilda
     * Creates the parser instance.
     *
     * @name Tilda
     * @function
     * @param {Object} info The `info` object passed to `TildaAction`.
     * @param {Object} options The `options` passed to `TildaAction`, extended with:
     *
     *  - `defaultOptions` (Array): Default and global options (default: help and version options).
     *  - `argv` (Array): A cutom array of arguments to parse (default: process arguments).
     *
     * @returns {Tilda} The `Tilda` instance containing:
     *
     *  - `actions` (Object): An object containing the action objects.
     *  - `version` (String): The version (used in help and version outputs).
     *  - `argv` (Array): Array of arguments to parse.
     *  - `_globalOptions` (Array): The global options, appended to all the actions.
     *  - `actionNames` (Array): Action names in order.
     */
    constructor (info, options) {
        options = ul.merge(options, {
            defaultOptions: [
                {
                    opts: ["help", "h"]
                  , description: "Displays this help."
                  , handler: (opt, action) => {
                        this.displayHelp(action);
                    }
                }
              , {
                    opts: ["version", "v"]
                  , description: "Displays version information."
                  , handler: () => {
                        this.displayVersion();
                    }
                }
            ]
          , autoparse: true
          , argv: process.argv.slice(2)
        });

        super(info, options);
        this.actions = {};
        this.version = info.version;
        this.argv = options.argv;
        this._globalOptions = [];
        this.actionNames = [];
        this.globalOption(options.defaultOptions);
        process.nextTick(_ => this.parse());
    }

    /**
     * globalOption
     * Adds a global option for all the actions.
     *
     * @name globalOption
     * @function
     * @param {Array|Object} input The option object.
     */
    globalOption (input) {
        this._globalOptions.push(input);
        iterateObject(this.actions, action => {
            action.option(input);
        });
        this.option(input);
    }

    /**
     * action
     * Adds a new action.
     *
     * @name action
     * @function
     * @param {Object} input The info object passed to `TildaAction`.
     * @param {Array} opts The action options.
     */
    action (input, opts) {
        if (Array.isArray(input)) {
            input.forEach(c => this.action(c));
            return this;
        }
        let nAction = new TildaAction(input, opts);
        nAction.option(input.options);

        this._globalOptions.forEach(c => nAction.option(c));
        this.actionNames.push(nAction.name);
        if (this.actions[nAction.name]) {
            throw new Err("Duplicated action name '<actionName>'", {
                actionName: nAction.name
            });
        }
        this.actions[nAction.name] = nAction;
        return this;
    }

    /**
     * exit
     * Exits the process.
     *
     * @name exit
     * @function
     * @param {String|Object} msg The stringified message or an object containing the error code.
     * @param {Number} code The exit code (default: `0`).
     */
    exit (msg, code) {
        code = code || 0;
        if (typeof msg === "string") {
            console.log(msg);
            return process.exit(code);
        } else if (msg && msg.code) {
            let err = new Err(errors[msg.code], msg);
            return this.exit(err.message, 1);
        }
    }

    /**
     * parse
     * Parses the arguments. This is called internally.
     *
     * This emits the action names as events.
     *
     * @name parse
     * @function
     */
    parse () {
        let res = clp(this.argv)
          , actionName = res._[0]
          , action = this.actions[actionName] || this
          ;

        // Parse the options
        iterateObject(action.uniqueOpts, c => {

            let optValue = null
              , name = null
              ;

            // Find the option value
            iterateObject(c.opts, cOpt => {
                if (!isUndefined(res[cOpt])) {
                    optValue = res[cOpt];
                    name = cOpt;
                    return false;
                }
            });

            // Handle required options
            if (optValue === null && c.required) {
                this.exit({
                    code: "MISSING_REQUIRED_OPTION"
                  , option: c.aliases[1] || c.aliases[0]
                  , exe: this.name
                });
                return false;
            }

            // Ignore empty options
            if (optValue === null) { return; }

            // Missing value?
            if (c.name && typeof optValue === "boolean") {
                this.exit({
                    code: "MISSING_VALUE"
                  , option: c.aliases[c.opts.indexOf(name)]
                  , exe: this.name
                });
            }

            // Handle validate option value type
            if (c.type && !typpy(optValue, c.type)) {
                this.exit({
                    code: "INVALID_OPTION_VALUE"
                  , option: c.aliases[c.opts.indexOf(name)]
                  , exe: this.name
                });
                return false;
            }


            // Valid option value
            c.value = optValue;
            c.is_provided = true;
            if (c.handler) {
                c.handler(c, action);
            }
        });

        // Handle the action args
        if (action.argNames.length) {
            let values = res._.slice(action.actions ? 0 : 1)
              , diff = action.argNames.length - values.length
              ;

            if (diff > 0) {
                return this.exit({
                    code: "MISSING_ACTION_ARG"
                  , argName: action.argNames[diff - 1]
                  , exe: this.name
                });
            } else if (diff < 0) {
                return this.exit({
                    code: "TOO_MANY_ACTION_ARGS"
                  , exe: this.name
                });
            }

            action.args = arrsToObj(action.argNames, values);
        }

        this.emit(action.name, action);
    }

    /**
     * displayVersion
     * Returns the version information.
     *
     * @name displayVersion
     * @function
     * @return {String} The version information.
     */
    displayVersion () {
        this.exit(this.name + " " + this.version);
    }

    /**
     * displayHelp
     * Displays the help output.
     *
     * @name displayHelp
     * @function
     * @param {TildaAction} action The action you want to display help for.
     */
    displayHelp (action) {

        let isMain = !!action.actions
          , hasActions = !isEmptyObj(action.actions || {})
          , hasOptions = !isEmptyObj(action.options)
          , helpOutput = ""
          ;

        helpOutput += "Usage: " + this.name + " "
                   + (isMain ? "<command>" : action.name)
                   + action.argNames.map(x => " <" + x + ">").join("")
                   + (hasOptions ? " [options]" : "")
                   + `\n\n${textWrap(action.description, 80)}\n`
                   ;


        if (hasActions) {
            helpOutput += "\nCommands:\n";
            let commandTable = new Table(TABLE_OPTIONS);

            action.actionNames.forEach(cActionName => {
                let cAct = action.actions[cActionName];
                commandTable.addRow([cAct.name, textWrap(cAct.description, 50)]);
            });

            helpOutput += removeEmptyLines(
                ansiParser.removeAnsi(
                    commandTable.toString()
                )
            );
        }

        if (hasOptions) {
            helpOutput += "\nOptions:\n";
            let optionsTable = new Table(TABLE_OPTIONS);
            action.uniqueOpts.sort(x => {
                return ~x.aliases.indexOf("-h") || ~x.aliases.indexOf("-v")  ? 1 : -1;
            }).forEach(cOpt => {
                let optStr = cOpt.aliases.join(", ");
                if (cOpt.name) {
                    optStr += " <" + cOpt.name + ">";
                }

                optionsTable.addRow([optStr, textWrap(cOpt.description, 50)]);
            });
            helpOutput += removeEmptyLines(
                ansiParser.removeAnsi(
                    optionsTable.toString()
                )
            );
        }

        if (action.examples.length) {
            helpOutput += "\nExamples:";
            helpOutput += "\n" + action.examples.map(c => indento((/^(\$|\#)/.test(c) ? "" : "$ ") + c, 2)).join("\n") + "\n";
        }

        if (action.notes.length) {
            helpOutput += "\n" + textWrap(action.notes, 80);
        }

        if (this.documentation) {
            helpOutput += `\nDocumentation can be found at ${this.documentation}.`;
        }

        this.exit(helpOutput);
    }

    /**
     * main
     * Append a handler when the main action is used.
     *
     * @name main
     * @function
     * @param {Function} cb The callback function.
     */
    main (cb) {
        return this.on(this.name, cb);
    }
};
