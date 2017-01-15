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

const Tilda = require("../lib")
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
  , args: [{
        name: "text"
      , type: String
      , desc: "The text to display."
      , stdin: true
    }]
}, {
    stdin: true
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
        text: action.stdinData || action.args.text || " "
      , e: action.options.eye.value
      , T: action.options.tongue.value
      , f: action.options.cowfile.value
    }));
});
