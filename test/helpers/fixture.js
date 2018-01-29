import { readFile, unlink, writeFile } from "fs"
import { resolve } from "path"
import { promisify } from "util"

import { dirToJson } from "../../lib/config"

export const jsonDir = resolve(__dirname, "../fixture")

export async function readFixtures() {
  let { json, jsonMap } = await dirToJson(jsonDir)

  let fixtureJson = {}
  let fixturePaths = {}

  for (let basename in jsonMap) {
    let path = resolve(jsonDir, basename)
    let json = await promisify(readFile)(path)

    fixtureJson[basename] = json
    fixturePaths[basename] = path
  }

  return { fixtureJson, fixturePaths, json, jsonMap }
}

export async function readFixture(basename) {
  let path = resolve(jsonDir, `${basename}.json`)
  let json = await promisify(readFile)(path)

  return JSON.parse(json)
}

export async function writeFixtures({
  fixtureJson,
  fixturePaths,
}) {
  for (let basename in fixtureJson) {
    promisify(writeFile)(
      fixturePaths[basename],
      fixtureJson[basename]
    )
  }
  let newJson = resolve(jsonDir, "new.json")
  promisify(unlink)(newJson).catch(() => {})
}
