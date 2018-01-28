import { readdir, readFile, stat } from "graceful-fs"
import { resolve } from "path"
import { writeFile } from "steno"
import { promisify } from "util"

import dot from "camel-dot-prop-immutable"
import { build } from "structured-json"

export function getter(config) {
  return (props, condition = "default") =>
    dot.get(config[condition], props)
}

export function setter({
  conditions,
  config,
  jsonDir,
  json,
  jsonMap,
}) {
  return (props, value, op = "set") => {
    load({ conditions, config, jsonDir })
    dot[op](json, props, value)
    write({ json, jsonDir, jsonMap, props })
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
    let obj = {}

    if (keys.includes(prop)) {
      for (let key of keys) {
        Object.assign(obj, { [key]: json[key] })
      }

      let jsonStr = JSON.stringify(obj, null, 2)
      let path = resolve(jsonDir, basename)

      promises.push(promisify(writeFile)(path, jsonStr))
    }
  }

  return Promise.all(promises)
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
    let path = resolve(jsonDir, basename)
    let jsonStr = await promisify(readFile)(path, "utf8")
    let obj = JSON.parse(jsonStr)

    jsonMap[basename] = Object.keys(obj)

    Object.assign(json, obj)
  }

  return { json, jsonMap }
}
