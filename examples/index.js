#!/usr/bin/env node

const Clp = require("../lib");

var p = new Clp({
    name: "name-age"
  , version: "v1.0"
  , description: "Sample clp cli tool."
});

p.option([
    {
        opts: ["name", "n"]
      , desc: "Someone's name"
      , name: "name"
    }
  , {
        opts: ["age", "a"]
      , desc: "Someone's age"
      , name: "age"
    }
]);

p.action({
    name: "clone"
  , desc: "Clone a repository into a new directory."
  , options: [
        {
            opts: ["local", "l"],
            desc: "Bypass the normal \"Git aware\" transport mechanism.",
        }
    ]
}, { boolean: false });

p.on("clone", action => {
    if (action.options.local.is_provided) {
        console.log("Local");
    }
    console.log(action.value);
    console.log("Clone");
});

p.main(action => {
    if (isNaN(parseInt(p.options.age.value)) || p.options.age.value < 0) {
        return console.error("Invalid age.");
    }

    // Validate the name
    if (!p.options.name.value) {
        return console.error("Invalid name.");
    }

    // Use the values
    console.log(nameOption.value + " is " + ageOption.value + " year old.");
});
