import taskEnv from "../dist"
import { fixtures } from "fxtr"

test("default function", () => {
  expect(taskEnv).toBeInstanceOf(Function)
})

test("without parameters", () => {
  expect.assertions(1)
  return expect(taskEnv()).rejects.toEqual(
    new Error('task "defaultTask" not found')
  )
})

test("task w/ help", async () => {
  expect.assertions(1)
  await taskEnv({
    args: ["task", "-h"],
    tasks: [
      {
        help: ({ h }) => {
          expect(h).toBe(true)
        },
        task: () => {
          expect(true).toBe(false)
        },
      },
    ],
  })
})

test("task w/ aliased args", async () => {
  expect.assertions(2)
  await taskEnv({
    alias: { f: ["fizz"] },
    args: ["task", "-f"],
    tasks: [
      {
        task: ({ f, fizz }) => {
          expect(f).toBe(true)
          expect(fizz).toBe(true)
        },
      },
    ],
  })
})

test("task w/ aliased args from tasks", async () => {
  expect.assertions(10)
  await taskEnv({
    alias: { f: ["fizz"] },
    args: ["task", "-f", "-t"],
    tasks: [
      {
        preSetup: config => {
          config.alias.task = {
            f: ["foo"],
            t: ["test"],
          }
        },
        setup: (config, args) => {
          const { f, fizz, foo, t, test } = args
          expect(f).toBe(true)
          expect(fizz).toBe(true)
          expect(foo).toBe(true)
          expect(t).toBe(true)
          expect(test).toBe(true)
        },
        task: ({ f, fizz, foo, t, test }) => {
          expect(f).toBe(true)
          expect(fizz).toBe(true)
          expect(foo).toBe(true)
          expect(t).toBe(true)
          expect(test).toBe(true)
        },
      },
    ],
  })
})

test("task calls task", async () => {
  expect.assertions(2)
  await taskEnv({
    args: ["task", "-f"],
    tasks: [
      {
        task: ({ f, tasks: { task2 } }) => {
          expect(f).toBe(true)
          task2()
        },
        task2: ({ f }) => {
          expect(f).toBe(true)
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

test("task w/ preSetup", async () => {
  expect.assertions(3)
  await taskEnv({
    args: ["task", "-f"],
    preSetup: [
      (config, args) => {
        expect(args.f).toBe(true)
        config.args.push("--foo")
      },
    ],
    tasks: [
      {
        task: ({ f, foo }) => {
          expect(f).toBe(true)
          expect(foo).toBe(true)
        },
      },
    ],
  })
})

test("task w/ preSetup from tasks", async () => {
  expect.assertions(3)
  await taskEnv({
    args: ["task", "-f"],
    tasks: [
      {
        preSetup: (config, args) => {
          expect(args.f).toBe(true)
          config.args.push("--foo")
        },
        task: ({ f, foo }) => {
          expect(f).toBe(true)
          expect(foo).toBe(true)
        },
      },
    ],
  })
})

test("task w/ get and set", async () => {
  let { path } = await fixtures(__dirname, "fixtures")

  expect.assertions(2)

  await taskEnv({
    args: ["task"],
    stores: {
      config: {
        pattern: "**/*",
        root: path,
      },
    },
    tasks: [
      {
        task: async ({ config }) => {
          expect(
            await config.get("buzz.written")
          ).toBeUndefined()
          await config.set("buzz.written", true)
          expect(await config.get("buzz.written")).toBe(
            true
          )
        },
      },
    ],
  })
})

test("task w/ store setup", async () => {
  let { path } = await fixtures(__dirname, "fixtures")

  expect.assertions(2)

  await taskEnv({
    args: ["task"],
    preSetup: [
      args => ({
        ...args,
        stores: {
          config: {
            pattern: "**/*",
            root: path,
          },
        },
      }),
    ],
    tasks: [
      {
        task: async ({ config }) => {
          expect(
            await config.get("buzz.written")
          ).toBeUndefined()
          await config.set("buzz.written", true)
          expect(await config.get("buzz.written")).toBe(
            true
          )
        },
      },
    ],
  })
})
