import { run } from "commandland"
import DotStore from "dot-store"
import withFs from "dot-store-fs"
import { createPromptModule } from "inquirer"
import mri from "mri"
import opn from "opn"

async function taskEnv(config = {}) {
  config = {
    alias: {},
    setup: [],
    stores: {},
    tasks: [],
    teardown: [],
    urls: {},
    ...config,
  }

  let { setup } = config
  config = await runSetup({ config, setup })

  await runTasks(config)

  let { teardown } = config
  await runFns({ config, fns: teardown })

  return config
}

async function extractSetupFns(config) {
  let { tasks } = config

  for (let pkg of tasks) {
    if (pkg.setup) {
      config.setup.push(pkg.setup)
    }
    if (pkg.teardown) {
      config.setup.push(pkg.teardown)
    }
  }

  return config
}

async function help({ arg, config, pkg }) {
  let { parsedArgs, urls } = config
  let { h } = parsedArgs

  if (h) {
    let url = urls[arg]

    if (url) {
      await opn(url)
    } else if (pkg.help) {
      await pkg.help(parsedArgs, config)
    }
  }

  return h
}

function namespaceAliases(config) {
  config.alias = {
    default: {
      h: ["help"],
      ...config.alias,
    },
  }

  return config
}

async function runFns({ config, fns }) {
  if (fns) {
    for (let fn of fns) {
      config =
        (await fn(config, config.parsedArgs)) || config
    }
  }
  return config
}

async function runSetup({ config, setup: fns }) {
  config = namespaceAliases(config)
  config = await extractSetupFns(config)
  config = await setup(config)
  config = await runFns({ config, fns })

  return await setup(config)
}

async function runTasks(config) {
  let { parsedArgs, tasks } = config

  for (let arg of parsedArgs._) {
    let found = false

    for (let pkg of tasks) {
      if (pkg[arg]) {
        found = true

        if (!await help({ arg, config, pkg })) {
          await pkg[arg](parsedArgs, config)
        }
      }
    }

    if (!found) {
      throw new Error(`task "${arg}" not found`)
    }
  }
}

async function setup(config) {
  return {
    ...config,
    parsedArgs: await setupArgs(config),
  }
}

async function setupAlias({ config, options }) {
  let alias = config.alias["default"]

  for (let arg of options._) {
    let argAlias = config.alias[arg]

    if (argAlias) {
      for (let key in argAlias) {
        if (alias[key]) {
          argAlias[key] = alias[key].concat(argAlias[key])
        }
      }
      alias = { ...alias, ...argAlias }
    }
  }

  return alias
}

async function setupArgs(config) {
  let { args, tasks } = config
  let options = mri(args)

  let alias = await setupAlias({ config, options })
  options = mri(args, { alias })

  if (!options._.length) {
    options._ = ["defaultTask"]
  }

  let ask = createPromptModule()
  let stores = await setupStores(config)

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
