# Task Env

A framework for building reusable JS tasks.

| Feature                                 | Built With                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Parse CLI arguments](#write-some-code) | [mri](https://github.com/lukeed/mri#readme)                                                                            |
| [Interact with the CLI](#interact)      | [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme)                                                         |
| [Execute commands](#execute-commands)   | [commandland](https://github.com/winton/commandland#readme)                                                            |
| Readable [JSON store](#json-store)      | [structured-json](https://github.com/invrs/structured-json#readme)                                                     |
| Immutable [JSON store](#json-store)     | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme)                                   |
| Resilient [JSON store](#json-store)     | [steno](https://github.com/typicode/steno#readme) and [graceful-fs](https://github.com/isaacs/node-graceful-fs#readme) |

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

Provide the directory path via `jsonDir`:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  jsonDir: __dirname + "/config",
})
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
