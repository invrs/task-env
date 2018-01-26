import { readdir, readFile, writeFile } from "fs"
import { resolve } from "path"
import { promisify } from "util"

export const jsonDir = resolve(__dirname, "./fixture")

export async function readFixtures() {
  let basenames = await promisify(readdir)(jsonDir)
  let fixtures = {}
  let fixturePaths = {}

  for (let basename of basenames) {
    let path = resolve(jsonDir, basename)
    let json = await promisify(readFile)(path)

    fixtures[basename] = json
    fixturePaths[basename] = path
  }

  return { fixtures, fixturePaths }
}

export async function readFixture(fixture) {
  let path = resolve(jsonDir, `${fixture}.json`)
  let json = await promisify(readFile)(path)
  return JSON.parse(json)
}

export async function writeFixtures({
  fixtures,
  fixturePaths,
}) {
  for (let basename in fixtures) {
    promisify(writeFile)(
      fixturePaths[basename],
      fixtures[basename]
    )
  }
}
