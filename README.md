# Clone Session Script

This script automates the task of uploading the relevant session files to the course repository after the coach finished a session.

## Setup

❗️Important:

Before using the script, make sure to update the content of the `config.json`:

- set the **relative path** from this folder to your local copy of **web-curriculum-new-format**
- set the **relative path** from this folder to your local copy of the **course repository**.

## Usage

You can then copy the session files with this command:

```shell
node clone-session <session name>
```

### Optional flags

By appending the `--push` flag, the script autmatically creates a new branch named `session-<session name>` in the course repository, commits all changes and pushes the changes to a new remote branch. Afterwards, the coach can merge the new session files with a PR on Github.
