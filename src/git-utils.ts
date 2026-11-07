import { execSync } from "node:child_process";
import { CONFIG } from "./config.js";

const PROJECT_DIR = process.cwd();

export type GitUser = {
  name?: string;
  email: string;
  secret?: string;
};

export const gitUtils = (gitUser: GitUser | undefined) => {
  if (!gitUser) {
    console.log("Git user is not provided. Using default git user.");
  } else {
    gitConfigUser(gitUser);
  }

  const gitStatus = () => gitCmd("status --porcelain");

  const gitAdd = (path?: string) => gitCmd(`add ${path || "."}`);

  const gitCommit = (message: string) => gitCmd(`commit -m "${message}"`);

  const gitPush = () => gitCmd("push");

  const commitAndPush = (
    commitMessage: string = `Automated commit on ${new Date().toISOString()}`,
    path?: string,
  ) => {
    try {
      // Check for changes

      const status = gitStatus();

      if (!status) {
        console.log("Nothing to commit.");
        process.exit(0);
      }

      gitAdd(path);

      gitCommit(commitMessage);

      // Push if GIT_PUSH flag is true
      if (CONFIG.FLAGS.GIT_PUSH) {
        gitPush();
      }

      console.log("Successfully committed and pushed changes.");
    } catch (error) {
      console.error("Git automation failed:", error);
      process.exit(1);
    }
  };

  const changeUser = (newUser: GitUser) => {
    gitConfigUser(newUser);
  };

  return {
    commitAndPush,
    changeUser,
  };
};

function gitCmd(command: string): string {
  return execSync(`git ${command}`, {
    cwd: PROJECT_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function gitConfigUser({ name, email, secret }: GitUser) {
  if (name) {
    gitCmd(`config user.name "${name}"`);
    gitCmd(`config credential.https://github.com.username "${name}"`);
  } else {
    console.log("Git user name is not provided. Using default git user name.");
  }
  gitCmd(`config user.email "${email}"`);
  gitCmd(`config credential.helper "store"`);
  if (!secret) {
    console.log(
      "Git user secret is not provided. Processing without secret. Make sure you have access to the repository.",
    );
  } else {
    gitCmd(`config credential.https://github.com.password "${secret}"`);
  }
}
