# Task Env

A framework for writing tasks that execute commands and persist encrypted state aynchronously.

## Install

```bash
npm install --save task-env
```

Other dependencies:

* [git-crypt](https://github.com/AGWA/git-crypt) (`brew install git-crypt`)
* [GPG Suite](https://gpgtools.org) (manual download)

## Create task runner

```bash
touch run
chmod +x run
```

Now edit the `run` file you created:

```js
#!/usr/bin/env node

require("task-env")
  .cli(process.argv.slice(2))
  .catch(console.error);
```

## Create secrets

1. Open `GPG Keychain`, click "new"
2. Enter name and email, advanced options: "RSA and RSA" and "4096"

```bash
./run secrets -e "your.gpg@email.com"
```

## Add tasks

To add task packages (such as [`ops-tasks`](/invrs/ops-tasks)):

```bash
npm install --save ops-tasks
```

Then in your task runner:

```js
#!/usr/bin/env node

require("task-env")
  .tasks(require("ops-tasks"))
  .cli(process.argv.slice(2))
  .catch(console.error);
```
