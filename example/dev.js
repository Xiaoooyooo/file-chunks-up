import { spawn } from "child_process";

function execCommand(command) {
  const r = spawn(command, { shell: true, stdio: "inherit" });
  r.addListener("error", (error) => {
    console.log(error);
  });
  r.addListener("message", (e) => {
    console.log(e);
  });
}

execCommand("npx vite dev");
execCommand("node server.js");
