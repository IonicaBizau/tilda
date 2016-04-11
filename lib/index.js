"use strict";

const events = require("events")
    , ul = require("ul")
    , minimist = require("minimist")
    , iterateObject = require("iterate-object")
    , isUndefined = require("is-undefined")
    , deffy = require("deffy")
    ;

class TildaOption {
    constructor (input) {
        this.name = input.name;
        this.description = input.description || input.desc;
        this.opts = input.opts;
        this.value = null;
        if (!isUndefined(input.default)) {
            this.value = this.default = input.default;
        }
        this.aliases = this.opts.map(c => {
            return (c.length === 1 ? "-" : "--") + c
        });
        this.aliases.sort(a => a.length === 2 ? -1 : 1);
        this.is_provided = false;
        this.handler = input.handler;
    }
}

class Tilda extends events.EventEmitter {
    constructor (info, options) {
        super();
        options = options || {};
        this.options = {};
        this.description = info.description || info.desc;
        this.name = Object.keys(info.bin || {})[0] || info.name;
        this.uniqueOpts = [];
        this.boolean = deffy(options.boolean, true);
        this.args = [];
        this.value = null;
    }
    option (input) {
        if (!input) { return; }
        if (Array.isArray(input)) {
            return input.forEach(c => this.option(c));
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
    }
}

module.exports = class Clp extends Tilda {
    constructor (info, options) {
        super(info, options);
        this.actions = {};
        this.version = info.version;
        options = ul.merge(options, {
            defaultOptions: [
                {
                    opts: ["help", "h"]
                  , description: "Displays this help."
                  , handler: () => {
                        this.displayHelp();
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
          , args: process.argv.slice(2)
        });
        this.args = options.args;
        this._globalOptions = [];
        this.globalOption(options.defaultOptions);
        process.nextTick(_ => this.parse());
    }
    globalOption (input) {
        this._globalOptions.push(input);
        iterateObject(this.actions, action => {
            action.option(input);
        });
        this.option(input);
    }
    action (input, opts) {
        if (Array.isArray(input)) {
            return input.forEach(c => this.action(c));
        }
        let nAction = new Tilda(input, opts);
        nAction.option(input.options);

        this._globalOptions.forEach(c => nAction.option(c));
        this.actions[nAction.name] = nAction;
    }

    parse () {
        let res = minimist(this.args)
          , actionName = res._[0]
          , action = this.actions[actionName] || this
          ;

        if (action.boolean === false) {
            debugger
            action.args = res._.slice(1);
            action.value = action.args[0];
        }

        iterateObject(action.options, (c, name) => {
            let optValue = res[name]
            if (isUndefined(optValue)) {
                return;
            }
            c.value = optValue;
            c.is_provided = true;
            if (c.handler) {
                c.handler(c, action);
            }
        });

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
        console.log(this.name + " " + this.version);
        process.exit(0);
    }
    displayHelp (action) {

//          , hasActions = !!Object.keys(this.actions).length
        console.log(43);
        process.exit(0);
    }
    main (cb) {
        return this.on(this.name, cb);
    }
};
