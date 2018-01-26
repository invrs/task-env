import { resolve } from "path"

import mri from "mri"

import { camelCase } from "./string"
import { getter, setter, load } from "./config"

module.exports = async function({
  alias,
  args,
  conditions,
  jsonDir,
  dir,
  setup,
  tasks,
  teardown,
} = {}) {
  let config = {}

  dir = dir || process.cwd()
  jsonDir = jsonDir || resolve(dir, "./secrets/config")

  let { json, jsonMap } = await load({
    conditions,
    config,
    jsonDir,
  })

  args = {
    ...mri(args, { alias }),
    get: getter(config),
    set: setter({
      conditions,
      jsonDir,
      json,
      jsonMap,
    }),
  }

  if (setup) {
    setup(args)
  }

  if (args._.length) {
    await tasks[camelCase(args._.shift())](args)
  }

  if (teardown) {
    teardown(args)
  }
}
