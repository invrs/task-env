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

  let { setup } = config
  config = await runSetup({ config, setup })

  let { parsedArgs, tasks, teardown } = config

  await runTasks({ parsedArgs, tasks })
  await runFns({ config, fns: teardown })
}

async function runFns({ config, fns }) {
  if (fns) {
    for (let fn of fns) {
      config = (await fn(config)) || config
    }
  }
  return config
}

async function runSetup({ config, setup: fns }) {
  config = await setup(config)
  config = await runFns({ config, fns })
  return await setup(config)
}

async function runTasks({ parsedArgs, tasks }) {
  for (let arg of parsedArgs._) {
    let key = camelCase(arg)
    let found = false

    for (let pkg of tasks) {
      if (pkg[key]) {
        found = true
        await pkg[key](parsedArgs)
      }
    }

    if (!found) {
      throw new Error(`task "${key}" not found`)
    }
  }
}

async function setup(config) {
  return {
    ...config,
    parsedArgs: await setupArgs(config),
  }
}

async function setupArgs(config) {
  let { alias, args, tasks } = config

  let ask = createPromptModule()
  let options = mri(args, { alias })
  let stores = await setupStores(config)

  if (!options._.length) {
    options._ = ["default.task"]
  }

  let parsedArgs = {
    ...options,
    ...stores,
    ask,
    run,
  }

  parsedArgs.tasks = await setupTasks({ parsedArgs, tasks })

  return parsedArgs
}

async function setupStores(config) {
  let { parsedArgs = {}, stores } = config
  let args = {}

  for (let store in stores) {
    args[store] =
      parsedArgs[store] ||
      (await withFs(new DotStore(), stores[store]))
  }

  return args
}

async function setupTasks({ parsedArgs, tasks }) {
  let boundTasks = {}

  for (let pkg of tasks) {
    for (let task in pkg) {
      let taskFn = pkg[task]
      boundTasks[task] = args => {
        return taskFn({ ...parsedArgs, ...args })
      }
    }
  }

  return boundTasks
}

module.exports = taskEnv
