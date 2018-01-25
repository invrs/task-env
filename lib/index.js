import { resolve } from "path"

import mri from "mri"

import { camelCase } from "./string"
import { getter, setter, load } from "./config"

module.exports = async function({
  alias,
  args,
  conditions,
  dir,
  setup,
  tasks,
  teardown,
} = {}) {
  let config = {}
  let configDir = resolve(
    dir || process.cwd(),
    "./secrets/config"
  )

  let { json, jsonMap } = await load({
    conditions,
    config,
    configDir,
  })

  args = {
    ...mri(args, { alias }),
    get: getter(config),
    set: setter({
      conditions,
      configDir,
      json,
      jsonMap,
    }),
  }

  if (setup) setup(args)

  if (args._.length) {
    await tasks[camelCase(args._.shift())](args)
  }

  if (teardown) teardown(args)
}
