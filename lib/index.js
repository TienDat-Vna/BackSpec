const { cli } = require("./cli");
const { runInit } = require("./commands/init");
const { runCreateSpec } = require("./commands/spec");
const { runDoctor } = require("./commands/doctor");
const { runSync, syncRules, syncSkills } = require("./commands/sync");
const { runList } = require("./commands/list");
const { runStatus } = require("./commands/status");
const { runAdopt } = require("./commands/adopt");
const { runValidate } = require("./commands/validate");
const { runOverride } = require("./commands/override");
const ui = require("./ui");

module.exports = {
  cli,
  runInit,
  runCreateSpec,
  runDoctor,
  runSync,
  syncRules,
  syncSkills,
  runList,
  runStatus,
  runAdopt,
  runValidate,
  runOverride,
  ui,
};
