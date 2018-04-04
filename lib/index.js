import { resolve } from "path"

import { run } from "commandland"
import getSet from "dot-get-set"
import { createPromptModule } from "inquirer"
import mri from "mri"

import { camelCase } from "./string"

async function taskEnv({
  alias,
  args,
  config,
  configGlob,
  root,
  setup,
  tasks = [],
  teardown,
} = {}) {
  let dirs = buildDirs({ config, root })
  config = await getSet(dirs.abs.config, configGlob)

  args = {
    ...mri(args, { alias }),
    ask: createPromptModule(),
    config,
    dirs,
    run,
  }

  args.tasks = bindTasks(tasks, args)

  args = await runFns(setup, args)
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

function buildDirs({ config, root }) {
  let dirs = {
    config: config || "config",
    root: root || process.cwd(),
  }

  dirs.abs = {
    config: resolve(dirs.root, dirs.config),
  }

  return dirs
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

module.exports = taskEnv
