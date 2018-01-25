import { resolve } from "path"
import { load } from "../lib/config"

test("ok", async () => {
  let config = {}
  let { json, jsonMap } = await load({
    config,
    jsonDir: resolve(__dirname, "./fixture"),
  })
  expect(config).toEqual({ default: { fizz: {} } })
  expect(json).toEqual({ fizz: {} })
  expect(jsonMap).toEqual({ "fizz.json": ["fizz"] })
})
