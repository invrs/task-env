import { resolve } from "path"
import { load } from "../lib/config"

test("load", async () => {
  let config = {}
  let { json, jsonMap } = await load({
    config,
    jsonDir: resolve(__dirname, "./fixture"),
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
    jsonDir: resolve(__dirname, "./fixture"),
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
