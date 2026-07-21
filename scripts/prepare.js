const fs = require("fs");
const path = require("path");

const apiStatic = path.join(__dirname, "../api/app/static");
const placeholderFile = path.join(
  __dirname,
  "../api/app/static.placeholder.html",
);
const targetFile = path.join(apiStatic, "index.html");

// Only copy placeholder if the static directory or index.html doesn't exist
// This ensures we don't overwrite a production React build on installs
if (!fs.existsSync(targetFile)) {
  console.log("Copying static HTML placeholder to api/app/static/...");
  if (!fs.existsSync(apiStatic)) {
    fs.mkdirSync(apiStatic, { recursive: true });
  }
  fs.copyFileSync(placeholderFile, targetFile);
  console.log("Placeholder copied successfully.");
} else {
  console.log("Static index.html already exists. Skipping placeholder setup.");
}
