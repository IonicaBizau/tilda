## Documentation

You can see below the API reference of this module.

### `TildaOption(input)`
The `TildaOption` class used for creating option objects.

#### Params
- **Object** `input`: An object containing the following fields:
 - `name` (String): The option name (optional).
 - `description` (String): The option description.
 - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
 - `default` (Anything): The default value.
 - `handler` (Function): The option handler which will be called when the
   option is found in the arguments. The first parameter is the option
   object and the second argument is the action where the option belongs to.
 - `required` (Boolean): A flag representing if the option is mandatory or not (default: `false`).
 - `type` (Class|String): The type class (e.g. `String`) or its stringified representation (e.g. `"string"`).
 - `prompt` (Boolean|Object): If `false`, it will disable the prompt even if the option is required. If it's an object, it will passed as options to `prompt-sync`.

#### Return
- **TildaOption** The `TildaOption` instance.
 - `description` (String): The option description.
 - `opts` (Array): An array of aliases (e.g. `["age", "a"]`).
 - `aliases` (Array): An array of strings containing the computed aliases,
    the single letter ones being the first (e.g. `["-n", "--name"]`).
 - `value` (null|String|DefaultValue): The option value which was found
    after processing the arguments.
 - `def` (Anything): The provided default value.
 - `is_provided` (Boolean): A flag if the option was or not been provided.
 - `handler` (Function): The handler function.
 - `required` (Boolean): The required value.
 - `type` (Class|String): The option value type.
 - `prompt` (Boolean|Object): The prompt settings..

### `TildaAction(info, options)`
The `TildaAction` class used for creating action objects.

This is extended `EventEmitter`.

#### Params
- **String|Object** `info`: The path to a containing the needed information or an object containing:
 - `description|desc` (String): The action description.
 - `name` (String): The action name.
 - `bin` (Object): A `package.json`-like `bin` field (optional).
 - `args` (Array): An array of strings/objects representing the action argument names (default: `[]`).
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.
- **Object** `options`: An object containing the following fields (if provided, they have priority over the `info` object):

 - `args` (Array): An array of strings/objects representing the action argument names (default: `[]`).
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.

#### Return
- **TildaAction** The `TildaAction` instance containing:
 - `options` (Object): The action options.
 - `description` (String): The action description.
 - `name` (String): The action name.
 - `uniqueOpts` (Array): An array of unique options in order.
 - `_args` (Array): The action arguments.
 - `argNames` (Array): The action argument names.
 - `args` (Object): The arguments' values.
 - `examples` (Array): An array of strings containing examples how to use the action.
 - `notes` (String): Additional notes to display in the help command.
 - `documentation` (String): Action-related documentation.
 - `stdinData` (String): The stdin data.

### `readInfo(info)`
Converts the info input into json output.

#### Params
- **String|Object** `info`: The info object or path to a json file.

#### Return
- **Object** The info object.

### `option(input)`
Adds one or more options to the action object.

#### Params
- **Array|Object** `input`: An array of option objects or an object passed to the `TildaOption` class.

### `Tilda(info, options)`
Creates the parser instance.

#### Params
- **Object** `info`: The `info` object passed to `TildaAction`.
- **Object** `options`: The `options` passed to `TildaAction`, extended with:
 - `defaultOptions` (Array): Default and global options (default: help and version options).
 - `argv` (Array): A cutom array of arguments to parse (default: process arguments).
 - `stdin` (Boolean): Whether to listen for stdin data or not (default: `false`).

#### Return
- **Tilda** The `Tilda` instance containing:
 - `actions` (Object): An object containing the action objects.
 - `version` (String): The version (used in help and version outputs).
 - `argv` (Array): Array of arguments to parse.
 - `_globalOptions` (Array): The global options, appended to all the actions.
 - `actionNames` (Array): Action names in order.

### `globalOption(input)`
Adds a global option for all the actions.

#### Params
- **Array|Object** `input`: The option object.

### `action(input, opts)`
Adds a new action.

#### Params
- **Object** `input`: The info object passed to `TildaAction`.
- **Array** `opts`: The action options.

### `exit(msg, code)`
Exits the process.

#### Params
- **String|Object** `msg`: The stringified message or an object containing the error code.
- **Number** `code`: The exit code (default: `0`).

### `parse()`
Parses the arguments. This is called internally.

This emits the action names as events.

### `displayVersion()`
Returns the version information.

#### Return
- **String** The version information.

### `displayHelp(action)`
Displays the help output.

#### Params
- **TildaAction** `action`: The action you want to display help for.

### `main(cb)`
Append a handler when the main action is used.

#### Params
- **Function** `cb`: The callback function.

### `convertTo(classConst, input, opts)`
Converts an input into a class instance.

#### Params
- **Class** `classConst`: The class to convert to.
- **Object|Array** `input`: The object info.
- **Object** `opts`: The options object (optional).

#### Return
- **TildaAction|TildaOption** The input converted into a class instance.

