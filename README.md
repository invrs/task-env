# Task Env

A framework for building reusable JS tasks.

| Feature                                 | Built With                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Parse CLI arguments](#write-some-code) | [mri](https://github.com/lukeed/mri#readme)                                                                                                       |
| [Interact with the CLI](#interact)      | [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme)                                                                                    |
| [Execute commands](#execute-commands)   | [commandland](https://github.com/winton/commandland#readme)                                                                                       |
| Readable [JSON store](#json-store)      | [structured-json](https://github.com/invrs/structured-json#readme)                                                                                |
| Immutable [JSON store](#json-store)     | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme)                                                              |
| Resilient [JSON store](#json-store)     | [proper-lockfile](https://github.com/moxystudio/node-proper-lockfile#readme) and [graceful-fs](https://github.com/isaacs/node-graceful-fs#readme) |

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
  rootDir: __dirname,
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
  rootDir: __dirname,
  tasks: [require("./say-hello")],
})
```

## Interact

```js
export async function happy({ ask }) {
  let { happy } = await ask([
    {
      type: "confirm",
      name: "happy",
      message: "Are you happy?",
    },
  ])
}
```

See the [Inquirer.js `prompt` docs](https://github.com/SBoudrias/Inquirer.js#methods) for available options.

## Call other tasks

```js
export function sayHello({ tasks }) {
  tasks.say({ text: "hello" })
}

export function say({ text }) {
  console.log(">", text)
}
```

Calling through `tasks` binds the CLI arguments and helper functions, as if the task were called via CLI.

## Execute commands

```js
export async function ls({ run }) {
  await run("ls", ["/"])
}
```

See the [commandland docs](https://github.com/winton/commandland#execution-options) for available options.

## JSON store

Create a directory with some JSON files:

```json
{
  "users": {
    "bob": {
      "key": "~/.ssh/bob_rsa"
    }
  }
}
```

Specify a `jsonDir` option (defaults to `rootDir + "/config"`):

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  rootDir: __dirname,
  jsonDir: __dirname + "/config",
  tasks: [require("./tasks/user")],
})
```

Within your task, get and set JSON using property strings:

```js
export async function user({ name, key, get, set }) {
  if (key) {
    await set(`users.${name}.key`, key)
  }

  console.log(">", get(`users.${name}`))
}
```

Run via CLI:

```bash
./run user --name=bob --key=~/.ssh/id_rsa
> { key: "~/.ssh/id_rsa" }
```

## All options

| Option     | Example                                 | Purpose                                                                             |
| ---------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| alias      | `{h: ["help"]}`                         | CLI arguments aliases                                                               |
| conditions | `["staging", "production"]`             | [structured-json conditions](https://github.com/invrs/structured-json#conditionals) |
| dirs       | `{ root: __dirname, json: "./config" }` | Absolute root directory and relative JSON directory                                 |
| setup      | `[({})=>{}]`                            | Setup functions                                                                     |
| teardown   | `[({})=>{}]`                            | Teardown functions                                                                  |
| tasks      | `[{ task: ({})=>{} }]`                  | Task functions                                                                      |
