import { resolve } from "path"

import { run } from "commandland"
import { createPromptModule } from "inquirer"
import mri from "mri"

import { camelCase } from "./string"
import { getter, load, setter } from "./config"

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

  await load({
    conditions,
    config,
    jsonDir,
  })

  args = {
    ...mri(args, { alias }),
    ask: createPromptModule(),
    get: getter(config),
    run,
    set: setter({
      conditions,
      config,
      jsonDir,
    }),
  }

  await runFns(setup, args)
  await runTasks(tasks, args)
  await runFns(teardown, args)
}

async function runFns(fns, args) {
  if (fns) {
    for (let fn of fns) {
      await fn(args)
    }
  }
  return args
}

async function runTasks(tasks, args) {
  if (args._.length) {
    for (let pkg of tasks) {
      let key = camelCase(args._.shift())
      if (pkg[key]) {
        await pkg[key](args)
      } else {
        throw new Error(`task "${key}" not found`)
      }
    }
  }
}
