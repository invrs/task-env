import { camelCase } from "../lib/string"

test("dots to camelcase", () => {
  expect(camelCase("fizz.bang.buzz")).toBe("fizzBangBuzz")
})
