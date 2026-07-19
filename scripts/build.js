const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const uiDist = path.join(__dirname, "../ui/dist");
const apiStatic = path.join(__dirname, "../api/app/static");

try {
  // 1. Build the UI production assets
  console.log("Building UI production bundle...");
  execSync("pnpm --filter ui build", { stdio: "inherit" });

  // 2. Clean the api/app/static directory
  console.log("Cleaning old files in api/app/static/...");
  if (fs.existsSync(apiStatic)) {
    fs.rmSync(apiStatic, { recursive: true, force: true });
  }
  fs.mkdirSync(apiStatic, { recursive: true });

  // 3. Copy built files from ui/dist/ to api/app/static/
  console.log("Copying new built files to api/app/static/...");
  if (fs.existsSync(uiDist)) {
    fs.cpSync(uiDist, apiStatic, { recursive: true });
    console.log("Files copied successfully!");
  } else {
    throw new Error("ui/dist directory was not found after compilation.");
  }

  console.log("Build and deployment complete!");
} catch (error) {
  console.error("Build execution failed:", error.message);
  process.exit(1);
}
