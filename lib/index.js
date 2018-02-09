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
  root,
  setup,
  tasks,
  teardown,
} = {}) {
  let dirs = buildDirs({ config, root })
  config = await getSet(dirs.abs.config)

  args = {
    ...mri(args, { alias }),
    ask: createPromptModule(),
    config,
    dirs,
    run,
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
