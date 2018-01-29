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

test("task calls task", async () => {
  expect.assertions(2)
  await taskEnv({
    args: ["task", "-h"],
    tasks: [
      {
        task: ({ h, tasks: { task2 } }) => {
          expect(h).toBe(true)
          task2()
        },
        task2({ h }) {
          expect(h).toBe(true)
        },
      },
    ],
  })
})

test("task w/ run", async () => {
  expect.assertions(2)
  await taskEnv({
    args: ["task"],
    tasks: [
      {
        task: async ({ run }) => {
          let { out, code } = await run("echo", ["hello"], {
            silent: true,
          })
          expect(out).toMatch(/hello/)
          expect(code).toBe(0)
        },
      },
    ],
  })
})

test("task w/ setup", async () => {
  expect.assertions(3)
  await taskEnv({
    args: ["task", "-h"],
    setup: [
      args => {
        expect(args.h).toBe(true)
        args.help = true
      },
    ],
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
