import {
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

import { dotCase } from "./string"

export function getter(config) {
  return (props, condition = "default") =>
    dot.get(config[condition], props)
}

export function setter({ conditions, config, jsonDir }) {
  return async (props, value, op) => {
    let { jsonMap } = await dirToJson(jsonDir)
    let basename = propsToBasename(props, jsonMap)
    let path = resolve(jsonDir, basename)

    await touch(path)

    let release = await lock(path, { retries: 1000 })
    let json = await write({ op, path, props, value })
    release()

    await load({ conditions, config, jsonDir })

    return json
  }
}

export function propsToBasename(props, jsonMap) {
  let prop = props.match(/[^.]+/)[0]

  for (let basename in jsonMap) {
    if (jsonMap[basename].includes(prop)) {
      return basename
    }
  }

  return `${dotCase(prop)}.json`
}

export async function write({
  op = "set",
  path,
  props,
  value,
}) {
  let json

  try {
    json = await promisify(readFile)(path, "utf8")
    json = JSON.parse(json)
  } catch (e) {
    json = {}
  }

  json = dot[op](json, props, value)

  await promisify(writeFile)(
    path,
    JSON.stringify(json, null, 2)
  )
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
    let jsonStr = await promisify(readFile)(path, "utf8")
    let obj = JSON.parse(jsonStr)

    jsonMap[basename] = Object.keys(obj)

    Object.assign(json, obj)
  }

  return { json, jsonMap }
}

export async function touch(path) {
  try {
    await promisify(stat)(path)
  } catch (e) {
    await promisify(writeFile)(path, "{}")
  }
}
