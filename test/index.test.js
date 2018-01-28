import taskEnv from "../lib"

import {
  jsonDir,
  readFixtures,
  writeFixtures,
} from "./helpers/fixture"

test("without parameters", () => {
  expect.assertions(1)
  return expect(taskEnv()).resolves.toBe(undefined)
})

test("task w/ aliased args", async () => {
  expect.assertions(2)
  await taskEnv({
    alias: { h: ["help"] },
    args: ["task", "-h"],
    tasks: [
      {
        task: ({ h, help }) => {
          expect(h).toBe(true)
          expect(help).toBe(true)
        },
      },
    ],
  })
})

test("task w/ get and set", async () => {
  let fixtures = await readFixtures()

  expect.assertions(3)

  await taskEnv({
    args: ["task"],
    conditions: ["condition"],
    jsonDir,
    tasks: [
      {
        task: async ({ get, set }) => {
          expect(get("fizz.condition", "condition")).toBe(
            true
          )

          expect(get("fizz.condition")).toBe(undefined)

          await set("buzz.written", true)

          expect(get("buzz.written")).toBe(true)
        },
      },
    ],
  })

  writeFixtures(fixtures)
})
