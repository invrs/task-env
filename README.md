# Task Env

A framework for building reusable JS tasks.

| Feature              | Components                                                                                                             |
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

Given a directory of JSON files:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  jsonDir: __dirname + "/config",
})
```

And a JSON file:

```json
{
  "users": {
    "bob": {
      key: "~/.ssh/bob_rsa"
    }
  }
}
```

Get and set JSON using property locator strings:

```js
export function user({ name, key, get, set }) {
  if (key) {
    set(`users.${name}.key`, key)
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

| Option     | Value                            | Purpose                                                                       |
| ---------- | -------------------------------- | ----------------------------------------------------------------------------- |
| alias      | `{ argument: [ "alias" ] }`      | CLI arguments aliases                                                         |
| conditions | `[ "condition1", "condition2" ]` | [structured-json](https://github.com/invrs/structured-json#readme) conditions |
| jsonDir    | `__dirname + "/config"`          | Path to directory of JSON                                                     |
| setup      | `[()=>{}]`                       | Setup functions                                                               |
| teardown   | `[()=>{}]`                       | Teardown functions                                                            |
| tasks      | `[{ task: ()=>{} }]`             | Task functions                                                                |
