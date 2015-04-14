function Option(aliases, description, hasValue, def) {
    var opt = {};


    if (aliases.constructor === Object) {
        opt = aliases;
    } else {
        if (typeof aliases === "string") {
            aliases = [aliases];
        }
        opt.aliases = aliases;
        opt.value = null;
        opt.def = def;
        opt.description = description;
        opt.has_value = has_value;
    }

    if (typeof opt.has_value === "string") {
        opt.def = opt.has_value;
        opt.has_value = true;
    } else if (typeof opt.has_value !== "boolean") {
        opt.has_value = true;
    }

    opt.aliases.forEach(function (c, i) {
        opt.aliases[i] = c.length === 1 ? "-" + c : ("--" + c);
    });
}

module.exports = Option;
