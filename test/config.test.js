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

  let buzz = await readFixture("buzz")
  expect(buzz).toEqual({ buzz: {} })

  await write({
    path: `${jsonDir}/buzz.json`,
    props: "buzz.written",
    value: true,
  })

  buzz = await readFixture("buzz")
  expect(buzz).toEqual({ buzz: { written: true } })

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

test("setter (new key)", async () => {
  let config = {}
  let fixtures = await readFixtures()
  let { json, jsonMap } = fixtures

  let set = setter({
    config,
    json,
    jsonDir,
    jsonMap,
  })

  await set("hello.written", true, "set", "hello.json")

  let hello = await readFixture("hello")
  expect(hello).toEqual({ hello: { written: true } })

  writeFixtures(fixtures)
})

test("setter (resilient)", async () => {
  let config = {}
  let fixtures = await readFixtures()
  let { json, jsonMap } = fixtures

  let set = setter({
    config,
    json,
    jsonDir,
    jsonMap,
  })

  await Promise.all([
    set("buzz.written", true),
    set("buzz.written2", true),
  ])

  let buzz = await readFixture("buzz")
  expect(buzz).toEqual({
    buzz: { written: true, written2: true },
  })

  writeFixtures(fixtures)
})
