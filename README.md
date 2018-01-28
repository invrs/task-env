# Task Env

A framework for building reusable JS tasks.

| Feature              | Built With                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Parse CLI arguments  | [mri](https://github.com/lukeed/mri#readme)                                                                            |
| Execute commands     | [commandland](https://github.com/winton/commandland#readme)                                                            |
| Readable JSON store  | [structured-json](https://github.com/invrs/structured-json#readme)                                                     |
| Immutable JSON store | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme)                                   |
| Resilient JSON store | [steno](https://github.com/typicode/steno#readme) and [graceful-fs](https://github.com/isaacs/node-graceful-fs#readme) |

## Install

```bash
npm install --save-dev task-env
```

## Create an executable

```bash
touch run
chmod +x run
```

## Write some code

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  tasks: [
    {
      sayHello: ({ hello }) => {
        console.log(">", hello)
      },
    },
  ],
})
```

## Run your task

```bash
./run say.hello --hello=hi
> hi
```

## Package tasks

Export task:

```js
export function sayHello({ hello }) {
  console.log(hello)
}
```

Require task:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  tasks: [require("./say-hello")],
})
```

## JSON store

Specify a directory of JSON files:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  jsonDir: __dirname + "/config",
})
```

Example JSON file:

```json
{
  "users": {
    "bob": {
      "key": "~/.ssh/bob_rsa"
    }
  }
}
```

Get and set JSON using property locator strings:

```js
export async function user({ name, key, get, set }) {
  if (key) {
    await set(`users.${name}.key`, key)
  }

  console.log(">", get(`users.${name}`))
}
```

Update the key via CLI:

```bash
./run user --name=bob --key=~/.ssh/id_rsa
> { key: "~/.ssh/id_rsa" }
```

## All options

| Option     | Example                     | Purpose                                                                             |
| ---------- | --------------------------- | ----------------------------------------------------------------------------------- |
| alias      | `{h: ["help"]}`             | CLI arguments aliases                                                               |
| conditions | `["staging", "production"]` | [structured-json conditions](https://github.com/invrs/structured-json#conditionals) |
| jsonDir    | `__dirname + "/config"`     | Path to directory of JSON                                                           |
| setup      | `[({})=>{}]`                | Setup functions                                                                     |
| teardown   | `[({})=>{}]`                | Teardown functions                                                                  |
| tasks      | `[{ task: ({})=>{} }]`      | Task functions                                                                      |
