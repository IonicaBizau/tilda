var Ul = require("ul")
  , Option = require("./option")
  , Errors = require("./errors")
  ;

function CLP(args, options, clpOptions) {

    var self = this;

    if (Array.isArray(options)) {
        clpOptions = options;
        options = {};
    }

    if (args === undefined) {
        args = Ul.clone(process.argv);
    }

    clpOptions = clpOptions || [];

    self.opts = options;
    self.options = clpOptions;
    self.args = args;
    self._ = {};
}


CLP.prototype.addHelpOption = function (args, desc) {
    this.addOption(new CLP.Option({
        aliases: args || ["-h", "--help"]
      , description: desc || "Displays this help."
      , hasValue: false
    }));
};

CLP.prototype.addVersionOption = function (args, desc) {
    this.addOption(new CLP.Option({
        aliases: args || ["-v", "--version"]
      , description: desc || "Displays version information."
      , hasValue: false
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
        c = self.args[c];
        opt = self._[c];

        if (opt === undefined) {
            err = self.error("UNKNOWN_OPTION", {
                option: c
            });

            if (self.opts.allow_exit) {
                console.error(err.toString());
                return process.exit(1);
            }
        } else if (opt.has_value) {
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

CLP.Option = Option;
CLP.Errors = Errors;

module.exports = CLP;
