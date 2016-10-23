#!/usr/bin/env node

"use strict";

const Tilda = require("../lib");

let p = new Tilda({
    name: "pass"
  , version: "1.0.0"
  , description: "User and pass example"
  , documentation: "https://github.com/IonicaBizau/tilda"
  , examples: [
        "node pass.js -u user -p pass"
      , "node pass.js -u user"
      , "node pass.js 'hello'"
    ]
  , args: [{
        name: "text"
      , type: String
      , desc: "The text to display."
      , stdin: true
    }]
}).option([
    {
        opts: ["user", "u"]
      , desc: "The username"
      , name: "user"
      , required: true
    }
  , {
        opts: ["password", "p"]
      , desc: "The password."
      , name: "password"
      , type: String
      , required: true
    }
]).main(action => {
    if (action.options.password.value !== "42") {
        return p.exit(new Error("Invalid password. Tip: the password is '42'."));
    }
    console.log(`${action.args.text} ${action.options.user.value}`);
});
