const { downloadAndUnzipVSCode } = require("@vscode/test-electron");

async function downloadVSCode() {
  try {
    const version = "stable";

    console.log(`Downloading VS Code version: ${version}`);
    const vscodeExecutablePath = await downloadAndUnzipVSCode(version);

    console.log(`VS Code downloaded to: ${vscodeExecutablePath}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to download VS Code:", error);
    process.exit(1);
  }
}

downloadVSCode();
