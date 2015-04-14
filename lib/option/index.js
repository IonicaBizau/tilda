function Option(aliases, description, name, def) {
    var opt = {};


    if (aliases.constructor === Object) {
        opt = aliases;
    } else {
        opt.aliases = aliases;
        opt.value = null;
        opt.def = def;
        opt.description = description;
        opt.name = name;
    }

    if (typeof opt.aliases === "string") {
        opt.aliases = [opt.aliases];
    }

    opt.aliases.forEach(function (c, i) {
        opt.aliases[i] = c.length === 1 ? "-" + c : ("--" + c);
    });

    opt.is_provided = false;

    return opt;
}

module.exports = Option;
