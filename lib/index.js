var Ul = require("ul")
  , Option = require("./option")
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

function CLP(args, options, clpOptions) {

    var self = this;

    if (args && args.constructor === Object) {
        clpOptions = options;
        options = args;
        args = undefined;
    }

    if (Array.isArray(options)) {
        clpOptions = options;
        options = {};
    }

    if (args === undefined) {
        args = Ul.clone(process.argv);
    }

    self.opts = Ul.merge(options, {
        allow_exit: true
      , help_opt: true
      , version_opt: true
      , name: "No Name"
      , exe: "no-exe"
      , version: "No Version"
      , process: false
    });

    self.options = [];
    self.args = args;
    self._ = {};

    clpOptions.forEach(self.addOption.bind(self));

    if (self.opts.help_opt) {
        self.addHelpOption();
    }

    if (self.opts.version_opt) {
        self.addVersionOption();
    }

    if (self.opts.process) {
        self.process();
    }
}


CLP.prototype.addHelpOption = function (args, desc) {
    this.addOption(new CLP.Option({
        aliases: args || ["h", "help"]
      , description: desc || "Displays this help."
      , hasValue: false
      , handler: function (opt) {
            if (!this.opts.allow_exit) { return; }
            console.log(this.displayHelp());
            process.exit(0);
        }
    }));
};

CLP.prototype.addVersionOption = function (args, desc) {
    this.addOption(new CLP.Option({
        aliases: args || ["v", "version"]
      , description: desc || "Displays version information."
      , hasValue: false
      , handler: function (opt) {
            if (!this.opts.allow_exit) { return; }
            console.log(this.displayVersion());
            process.exit(0);
        }
    }));
};

CLP.prototype.addOption = function (opt) {
    var self = this;
    opt.aliases.forEach(function (c) {
        self._[c] = opt;
    });
    self.options.push(opt);
};

CLP.prototype.process = function () {
    var self = this;
    for (var i = 0, c, opt, err; i < self.args.length; ++i) {
        c = self.args[i];
        if (c.charAt(0) !== "-") {
            continue;
        }

        opt = self._[c];
        debugger

        if (opt === undefined) {
            err = self.error("UNKNOWN_OPTION", {
                option: c
            });

            if (self.opts.allow_exit) {
                console.error(err.toString());
                process.exit(1);
            }

            return err;
        }

        opt.is_provided = true;

        if (opt.name) {
            opt.value = self.args[++i];
            if (opt.value === undefined) {
                err = self.error("MISSING_VALUE", {
                    option: c
                });

                if (self.opts.allow_exit) {
                    console.error(err.toString());
                    return process.exit(1);
                }
            }
        }

        if (typeof opt.handler === "function") {
            opt.handler.call(self, opt);
        }
    }
};

CLP.prototype.error = function (err_code, fields) {
    var str = CLP.Errors[err_code];
    if (str === undefined) {
        throw new Error("Invalid error code: " + err_code);
    }
    Object.keys(fields).forEach(function (c) {
        str = str.replace(new RegExp("{" + c + "}", "g"), fields[c]);
    });
    return new Error(str);
};

CLP.prototype.displayHelp = function () {
    var self = this
      , opts = self.opts
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
        helpTable.addRow([opt, c.description]);
    });

    str += AnsiParser.removeAnsi(helpTable.toString()).split("\n").filter(function (c) {
        return c.trim();
    }).join("\n");

    return str;
};

CLP.prototype.displayVersion = function () {
    return this.opts.exe + " " + this.opts.version;
};

CLP.Option = Option;
CLP.Errors = Errors;

module.exports = CLP;
