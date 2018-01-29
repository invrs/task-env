import {
  close,
  open,
  readdir,
  readFile,
  stat,
  writeFile,
} from "graceful-fs"
import { extname, resolve } from "path"
import { lock } from "proper-lockfile"
import { promisify } from "util"

import dot from "camel-dot-prop-immutable"
import { build } from "structured-json"

export function getter(config) {
  return (props, condition = "default") =>
    dot.get(config[condition], props)
}

export function setter({ conditions, config, jsonDir }) {
  return async (props, value, op = "set") => {
    let { json, jsonMap } = await dirToJson(jsonDir)

    json = dot[op](json, props, value)

    await write({ json, jsonDir, jsonMap, props })
    await load({ conditions, config, jsonDir })

    return json
  }
}

export async function write({
  json,
  jsonDir,
  jsonMap,
  props,
}) {
  let prop = props.match(/[^.]+/)[0]
  let promises = []

  for (let basename in jsonMap) {
    let keys = jsonMap[basename]

    if (keys.includes(prop)) {
      writeJsonFile({
        basename,
        json,
        jsonDir,
        keys,
        promises,
      })
    }
  }

  if (!promises.length) {
    let basename = "new.json"
    let keys = jsonMap[basename] || []

    jsonMap[basename] = keys
    keys.push(prop)

    writeJsonFile({
      basename,
      json,
      jsonDir,
      keys,
      promises,
    })
  }

  return Promise.all(promises)
}

export function writeJsonFile({
  basename,
  json,
  jsonDir,
  keys,
  promises,
}) {
  let obj = {}

  for (let key of keys) {
    Object.assign(obj, { [key]: json[key] })
  }

  let jsonStr = JSON.stringify(obj, null, 2)
  let path = resolve(jsonDir, basename)
  let promise = writeFileAtomic(path, jsonStr)

  promises.push(promise)
}

export async function load({
  conditions = [],
  config,
  jsonDir,
}) {
  let { json, jsonMap } = await dirToJson(jsonDir)

  config.default = build(json)

  for (let condition of conditions) {
    config[condition] = build(json, {
      [condition]: true,
    })
  }

  return { json, jsonMap }
}

export async function dirToJson(jsonDir) {
  try {
    await promisify(stat)(jsonDir)
  } catch (e) {
    return {}
  }

  let files = await promisify(readdir)(jsonDir)
  let jsonMap = {}
  let json = {}

  for (let basename of files) {
    if (
      basename.charAt(0) == "." ||
      extname(basename) != ".json"
    ) {
      continue
    }

    let path = resolve(jsonDir, basename)
    let jsonStr = await readFileAtomic(path)
    let obj = JSON.parse(jsonStr)

    jsonMap[basename] = Object.keys(obj)

    Object.assign(json, obj)
  }

  return { json, jsonMap }
}

export async function readFileAtomic(path) {
  let release = await lock(path, { retries: 1000 })
  let output = await promisify(readFile)(path, "utf8")
  release()
  return output
}

export async function writeFileAtomic(path, data) {
  await touch(path)
  let release = await lock(path, { retries: 1000 })
  await promisify(writeFile)(path, data)
  return release()
}

export async function touch(path) {
  let fd = await promisify(open)(path, "a")
  await promisify(close)(fd)
}
