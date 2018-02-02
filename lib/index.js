import { resolve } from "path"

import { run } from "commandland"
import { createPromptModule } from "inquirer"
import mri from "mri"

import { camelCase } from "./string"
import { getter, load, setter } from "./config"

async function taskEnv({
  alias,
  args,
  conditions,
  dirs = {},
  setup,
  tasks,
  teardown,
} = {}) {
  let config = {}

  dirs.root = dirs.root || process.cwd()
  dirs.json = dirs.json || "./config"

  dirs.abs = {
    json: resolve(dirs.root, dirs.json),
  }

  await load({
    conditions,
    config,
    dirs,
  })

  args = {
    ...mri(args, { alias }),
    ask: createPromptModule(),
    dirs,
    get: getter({ config }),
    run,
    set: setter({
      conditions,
      config,
      dirs,
    }),
  }

  if (tasks) {
    args.tasks = bindTasks(tasks, args)
  }

  await runFns(setup, args)
  await runTasks(tasks, args)
  await runFns(teardown, args)
}

function bindTasks(tasks, defaults) {
  let boundTasks = {}

  for (let pkg of tasks) {
    for (let task in pkg) {
      let taskFn = pkg[task]
      boundTasks[task] = args => {
        return taskFn({ ...args, ...defaults })
      }
    }
  }

  return boundTasks
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

module.exports = taskEnv
