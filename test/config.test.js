import { load, write } from "../lib/config"
import {
  jsonDir,
  readFixture,
  readFixtures,
  writeFixtures,
} from "./helpers/fixture"

test("load", async () => {
  let config = {}
  let { json, jsonMap } = await load({
    config,
    jsonDir: jsonDir,
  })
  expect(config).toEqual({
    default: { bang: {}, buzz: {}, fizz: {} },
  })
  expect(json).toEqual({
    ">>? condition": { condition: true },
    bang: {},
    buzz: {},
    fizz: {},
  })
  expect(jsonMap).toEqual({
    "bang.json": ["bang"],
    "buzz.json": ["buzz"],
    "fizz.json": [">>? condition", "fizz"],
  })
})

test("load w/ conditions", async () => {
  let config = {}
  let { json, jsonMap } = await load({
    config,
    conditions: ["condition"],
    jsonDir,
  })
  expect(config).toEqual({
    condition: {
      bang: { condition: true },
      buzz: { condition: true },
      condition: true,
      fizz: { condition: true },
    },
    default: { bang: {}, buzz: {}, fizz: {} },
  })
  expect(json).toEqual({
    ">>? condition": { condition: true },
    bang: {},
    buzz: {},
    fizz: {},
  })
  expect(jsonMap).toEqual({
    "bang.json": ["bang"],
    "buzz.json": ["buzz"],
    "fizz.json": [">>? condition", "fizz"],
  })
})

test("write", async () => {
  let fixtures = await readFixtures()

  let json = { buzz: { written: true } }
  let jsonMap = {
    "bang.json": ["bang"],
    "buzz.json": ["buzz"],
    "fizz.json": [">>? condition", "fizz"],
  }

  let buzz = await readFixture("buzz")
  expect(buzz).toEqual({ buzz: {} })

  await write({
    json,
    jsonDir,
    jsonMap,
    props: "buzz.written",
  })

  buzz = await readFixture("buzz")
  expect(buzz).toEqual({ buzz: { written: true } })

  writeFixtures(fixtures)
})
