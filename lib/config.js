import { readFileSync, readdir, stat } from "fs"
import { resolve } from "path"
import { promisify } from "util"

import dot from "camel-dot-prop-immutable"
import { build } from "structured-json"

export function getter(config) {
  return (props, condition = "default") =>
    dot.get(config[condition], props)
}

export function setter({
  conditions,
  jsonDir,
  json,
  jsonMap,
}) {
  return (props, value, op = "set") => {
    load({ conditions, config, jsonDir })
    dot[op](json, props, value)
    write({ props, json, jsonMap })
  }
}

export function write({ props, json, jsonMap }) {
  let prop = props.match(/[^\.]+/)[0]

  for (let basename in jsonMap) {
    let map = jsonMap[basename]
    let obj = {}

    if (Object.keys(map).includes(prop)) {
      for (let key of map) {
        Object.assign(obj, json[key])
      }

      let jsonStr = JSON.stringify(obj, null, 2)
      promisify(fs.writeFile)(basename, jsonStr)
    }
  }
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

  let json = files.reduce((memo, basename) => {
    let path = resolve(jsonDir, basename)
    let jsonStr = readFileSync(path, "utf8")
    let obj = JSON.parse(jsonStr)

    jsonMap[basename] = Object.keys(obj)

    return Object.assign(memo, obj)
  }, {})

  return { json, jsonMap }
}
