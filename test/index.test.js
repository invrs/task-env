import taskEnv from "../lib"

test("without parameters", () => {
  expect.assertions(1)
  return expect(taskEnv()).resolves.toBe(undefined)
})
