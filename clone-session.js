import * as fs from "node:fs/promises";
import { exec } from "node:child_process";

(async function () {
  const session = process.argv[2];

  const { curriculumPath, coursePath } = JSON.parse(
    await fs.readFile("config.json")
  );

  const autoPush = process.argv.includes("--push");

  const sessionPath = `${coursePath}/sessions/${session}`;
  const copyTargets = [`${session}.md`, `challenges-${session}.md`, "assets"];

  console.log("Pulling latest changes for web-curriculum-new-format...");

  exec(
    `git --git-dir ${curriculumPath}/.git checkout main && git --git-dir ${curriculumPath}/.git pull`,
    async (error, stdout) => {
      if (error) {
        console.log(error);
        return;
      }

      console.log("done!");
      console.log("Creating new session folder...");

      try {
        await fs.mkdir(sessionPath);
        console.log("done!");
      } catch (error) {
        console.log(error.message);
      }

      console.log("copying files...");

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
          console.log(`Copied ${target}.`);
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  );
})();
