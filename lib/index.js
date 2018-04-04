import { run } from "commandland"
import DotStore from "dot-store"
import withFs from "dot-store-fs"
import { createPromptModule } from "inquirer"
import mri from "mri"

import { camelCase } from "./string"

async function taskEnv(config = {}) {
  config = {
    stores: {},
    tasks: [],
    ...config,
  }

  setupArgs(config)

  let { args, setup, tasks, teardown } = config

  await setupStores(config)
  config = await runFns(setup, config)
  await setupStores(config)

  args.tasks = bindTasks(tasks, args)

  await runTasks(tasks, args)
  await runFns(teardown, args)
}

function bindTasks(tasks, defaults) {
  let boundTasks = {}

  for (let pkg of tasks) {
    for (let task in pkg) {
      let taskFn = pkg[task]
      boundTasks[task] = args => {
        return taskFn({ ...defaults, ...args })
      }
    }
  }

  return boundTasks
}

async function runFns(fns, args) {
  if (fns) {
    for (let fn of fns) {
      args = await fn(args)
    }
  }
  return args
}

async function runTasks(tasks, args) {
  if (!args._.length) {
    args._ = ["default.task"]
  }

  for (let arg of args._) {
    let key = camelCase(arg)
    let found = false

    for (let pkg of tasks) {
      if (pkg[key]) {
        found = true
        await pkg[key](args)
      }
    }

    if (!found) {
      throw new Error(`task "${key}" not found`)
    }
  }
}

function setupArgs(config) {
  return (config.args = {
    ...mri(config.args, { alias: config.alias }),
    ask: createPromptModule(),
    run,
  })
}

async function setupStores(config) {
  let { stores } = config
  for (let store in stores) {
    config.args[store] =
      config.args[store] ||
      (await withFs(new DotStore(), stores[store]))
  }
}

module.exports = taskEnv
