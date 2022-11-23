import * as fs from "node:fs/promises";
import { exec } from "node:child_process";

(async function () {
  const session = process.argv[2];

  const { curriculumPath, coursePath } = JSON.parse(
    await fs.readFile("config.json")
  );

  if (!curriculumPath || !coursePath) {
    console.error(
      "Error: Specify the paths to the web-curriculum-new-format and course repository in the config.json."
    );
    return;
  }

  const autoPush = process.argv.includes("--push");

  const sessionPath = `${coursePath}/sessions/${session}`;

  console.log("Pulling latest changes for web-curriculum-new-format...");

  try {
    await new Promise((resolve, reject) =>
      exec(
        [`cd ${curriculumPath}`, `git checkout main`, `git pull`].join(" && "),
        (error, _stdout) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      )
    );
  } catch (error) {
    console.log(error);
    return;
  }

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
          force: true,
        }
      );
      console.log(`${target} ✅`);
    } catch (error) {
      console.error(error.message);
    }
  }

  if (autoPush) {
    console.log("Pushing new session to remote...");
    try {
      await new Promise((reject, resolve) =>
        exec(
          [
            `cd ${coursePath}`,
            `git checkout main`,
            `git pull`,
            `git switch -c session-${session} || git switch session-${session}`,
            `git add --all`,
            `git commit -m 'chore: add session ${session}'`,
            `git push -u origin session-${session}`,
            `git checkout main`,
          ].join(" && "),
          (error, stdout) => {
            if (error) {
              console.error(error);
              reject(error);
              return;
            }
            console.log("Push successful!");
            resolve();
          }
        )
      );
    } catch (error) {
      console.error(error);
    }
  }
})();
