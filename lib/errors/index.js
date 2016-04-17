"use strict";

const HELP_MSG = "\nRun '<exe> --help' for help."

module.exports = {
    MISSING_VALUE: "Missing value after '<option>'." + HELP_MSG
  , MISSING_ACTION_ARG: "Missing command argument '<argName>'." + HELP_MSG
  , TOO_MANY_ACTION_ARGS: "Too many arguments passed to this action." + HELP_MSG
  , MISSING_REQUIRED_OPTION: "Missing required option '<option>'." + HELP_MSG
  , INVALID_OPTION_VALUE: "Invalid value for option '<option>'." + HELP_MSG
  , INVALID_ARG_VALUE: "Invalid value for argument '<arg.name>'." + HELP_MSG
};
