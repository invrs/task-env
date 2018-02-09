# Task Env

A framework for building reusable JS tasks.

| Feature                                     | Built With                                                     |
| ------------------------------------------- | -------------------------------------------------------------- |
| [Parse CLI arguments](#write-some-code)     | [mri](https://github.com/lukeed/mri#readme)                    |
| [Interact with the CLI](#interact)          | [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#readme) |
| [Execute commands](#execute-commands)       | [commandland](https://github.com/winton/commandland#readme)    |
| [JSON and text store](#json-and-text-store) | [dot-get-set](https://github.com/invrs/dot-get-set#readme)     |

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
  root: __dirname,
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
  root: __dirname,
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

## JSON and text store

Task env uses [dot-get-set](https://github.com/invrs/dot-get-set#readme) to provide an immutable store with atomic filesystem persistence.

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

Specify a `config` option (defaults to `root + "/config"`):

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  config: "config",
  root: __dirname,
  tasks: [require("./tasks/user")],
})
```

Within your task, get and set JSON using dot-style property strings:

```js
export async function user({ config, name, key }) {
  if (key) {
    config = await config.set(`users.${name}.key`, key)
  }

  console.log(">", config.get(`users.${name}`))
}
```

Run via CLI:

```bash
./run user --name=bob --key=~/.ssh/id_rsa
> { key: "~/.ssh/id_rsa" }
```

## All options

| Option   | Example                | Purpose                                      |
| -------- | ---------------------- | -------------------------------------------- |
| alias    | `{h: ["help"]}`        | CLI arguments aliases                        |
| config   | `"config"`             | JSON and text config path (relative to root) |
| root     | `__dirname`            | Root directory path (absolute)               |
| setup    | `[args=>args]`         | Setup functions                              |
| teardown | `[args=>{}]`           | Teardown functions                           |
| tasks    | `[{ task: ({})=>{} }]` | Task functions                               |
