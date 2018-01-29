import { getter, setter, load, write } from "../lib/config"
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
    jsonDir,
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
    conditions: ["condition"],
    config,
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
  let { json, jsonMap } = fixtures

  json.buzz.written = true

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

test("write non-existent key", async () => {
  let fixtures = await readFixtures()
  let { json, jsonMap } = fixtures

  json.abc = {}

  await write({
    json,
    jsonDir,
    jsonMap,
    props: "abc",
  })

  let newJson = await readFixture("new")
  expect(newJson).toEqual({ abc: {} })

  writeFixtures(fixtures)
})

test("getter", () => {
  let config = {
    default: {
      fizzBang: { buzz: true },
    },
  }
  let get = getter(config)
  expect(get("fizz.bang.buzz")).toBe(true)
})

test("setter", async () => {
  let config = {}
  let fixtures = await readFixtures()
  let { json, jsonMap } = fixtures

  let set = setter({
    config,
    json,
    jsonDir,
    jsonMap,
  })

  await set("buzz.written", true)

  let buzz = await readFixture("buzz")
  expect(buzz).toEqual({ buzz: { written: true } })

  writeFixtures(fixtures)
})
