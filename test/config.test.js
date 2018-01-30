import {
  dirToJson,
  getter,
  setter,
  load,
  write,
} from "../lib/config"
import { fixtures } from "fxtr"

test("load", async () => {
  let config = {}
  let { path } = await fixtures(__dirname, "fixtures")
  let { json, jsonMap } = await load({
    config,
    jsonDir: path,
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
  let { path } = await fixtures(__dirname, "fixtures")
  let { json, jsonMap } = await load({
    conditions: ["condition"],
    config,
    jsonDir: path,
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
  let { path, read } = await fixtures(__dirname, "fixtures")

  let buzz = await read("buzz.json")
  expect(buzz).toEqual({ buzz: {} })

  await write({
    path: `${path}/buzz.json`,
    props: "buzz.written",
    value: true,
  })

  buzz = await read("buzz.json")
  expect(buzz).toEqual({ buzz: { written: true } })
})

test("getter", async () => {
  let { path } = await fixtures(__dirname, "fixtures")
  let config = {
    default: {
      fizzBang: { buzz: true },
    },
  }
  let get = getter({ config, jsonDir: path })
  expect(get("fizz.bang.buzz")).toBe(true)
})

test("setter", async () => {
  let config = {}
  let { path, read } = await fixtures(__dirname, "fixtures")
  let { json, jsonMap } = dirToJson(path)

  let set = setter({
    config,
    json,
    jsonDir: path,
    jsonMap,
  })

  await set("buzz.written", true)

  let buzz = await read("buzz.json")
  expect(buzz).toEqual({ buzz: { written: true } })
})

test("setter (new key)", async () => {
  let config = {}
  let { path, read } = await fixtures(__dirname, "fixtures")
  let { json, jsonMap } = dirToJson(path)

  let set = setter({
    config,
    json,
    jsonDir: path,
    jsonMap,
  })

  await set("helloWorld.written", true)

  let hello = await read("hello.world.json")
  expect(hello).toEqual({ helloWorld: { written: true } })
})

test("setter (resilient)", async () => {
  let config = {}
  let { path, read } = await fixtures(__dirname, "fixtures")
  let { json, jsonMap } = dirToJson(path)

  let set = setter({
    config,
    json,
    jsonDir: path,
    jsonMap,
  })

  await Promise.all([
    set("buzz.written", true),
    set("buzz.written2", true),
  ])

  let buzz = await read("buzz.json")
  expect(buzz).toEqual({
    buzz: { written: true, written2: true },
  })
})
