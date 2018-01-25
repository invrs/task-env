import { readFileSync, readdir, stat } from "fs"
import { promisify } from "util"

import dot from "camel-dot-prop-immutable"
import { build } from "structured-json"

export function getter(config) {
  return (props, condition = "default") =>
    dot.get(config[condition], props)
}

export function setter({
  conditions,
  configDir,
  json,
  jsonMap,
}) {
  return (props, value, op = "set") => {
    load({ conditions, config, configDir })
    dot[op](json, props, value)
    write({ props, json, jsonMap })
  }
}

export function write({ props, json, jsonMap }) {
  let prop = props.match(/[^\.]+/)[0]

  for (let file in jsonMap) {
    let map = jsonMap[file]
    let obj = {}

    if (Object.keys(map).includes(prop)) {
      for (let key of map) {
        Object.assign(obj, json[key])
      }

      let jsonStr = JSON.stringify(obj, null, 2)
      fs.writeFile(file, jsonStr, () => {})
    }
  }
}

export async function load({
  conditions = [],
  config,
  configDir,
}) {
  let { json, jsonMap } = await dirToJson(configDir)

  config.default = build(json)

  for (let condition of conditions) {
    config[condition] = build(config, {
      [condition]: true,
    })
  }

  return { json, jsonMap }
}

export async function dirToJson(configDir) {
  try {
    await promisify(stat)(configDir)
  } catch (e) {
    return {}
  }

  let files = await promisify(readdir)(configDir)
  let jsonMap = {}

  let json = files.reduce((memo, file) => {
    let data = JSON.parse(readFileSync(file, "utf8"))
    jsonMap[file] = Object.keys(data)
    return Object.assign(memo, data)
  }, {})

  return { json, jsonMap }
}
