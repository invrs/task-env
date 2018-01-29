import taskEnv from "../dist"
test("dist", () => {
  expect(taskEnv).toBeInstanceOf(Function)
})
