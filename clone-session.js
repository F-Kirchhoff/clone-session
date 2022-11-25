import * as fs from "node:fs/promises";
import { exec } from "node:child_process";

(async function () {
  const session = process.argv[2];
  const autoPush = process.argv.includes("--push");

  const { curriculumPath, coursePath } = JSON.parse(
    await fs.readFile("config.json")
  );

  if (!curriculumPath || !coursePath) {
    console.error(
      "Error: Specify the paths to the web-curriculum-new-format and course repository in the config.json."
    );
    return;
  }

  const sessionPath = `${coursePath}/sessions/${session}`;

  console.log("Pulling latest changes for web-curriculum-new-format...");

  await executeList([`git checkout main`, `git pull`], {
    cwd: process.cwd() + "/" + curriculumPath,
  });

  console.log("Creating new session folder...");

  try {
    await fs.mkdir(sessionPath);
    console.log(`Created session folder ${session}.`);
  } catch (error) {
    console.log(error.message);
  }

  console.log("copying files...");
  const copyTargets = [`${session}.md`, `challenges-${session}.md`, "assets"];

  for (const target of copyTargets) {
    try {
      await fs.cp(
        `${curriculumPath}/sessions/${session}/${target}`,
        `${sessionPath}/${target}`,
        {
          recursive: true,
        }
      );
      console.log(`${target} ✅`);
    } catch (error) {
      console.error(error.message);
    }
  }

  if (autoPush) {
    console.log("Pushing new session to remote...");
    await executeList(
      [
        `git checkout main`,
        `git pull`,
        `git switch -c session-${session} || git switch session-${session}`,
        `git add --all`,
        `git commit -m 'chore: add session ${session}'`,
        `git push -u origin session-${session}`,
        `git checkout main`,
      ],
      {
        cwd: process.cwd() + "/" + coursePath,
      }
    );
  }
})();

async function executeList(commands, options = {}) {
  try {
    for (const command of commands) {
      const response = await new Promise((resolve, reject) =>
        exec(command, options, (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        })
      );
      response && console.log(response);
    }
  } catch (error) {
    console.error(error);
  }
}
