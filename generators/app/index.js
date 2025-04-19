const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  initializing() {}

  prompting() {
    return this.composeWith(require.resolve("generator-code"), {
      extensionType: "",
      extensionName: this.options.extensionName || this.appname,
      displayName: this.options.displayName || this.appname,
      description:
        this.options.description || "My Visual Studio Code extension",
    }).then((answers) => {
      // Store the extensionName for use in the writing phase
      this.extensionConfig = answers.extensionConfig;
    });
  }

  writing() {
    // Access the extensionName stored in the prompting phase
    const extensionName = this.extensionConfig.name;
    const displayName = this.extensionConfig.displayName;

    // Copy only the .docker and .github directories and their contents
    const directoriesToCopy = [".docker", ".github", ".scripts", ".actrc"];

    directoriesToCopy.forEach((dir) => {
      this.fs.copy(
        this.templatePath(dir),
        this.destinationPath(`${extensionName}/${dir}`)
      );
    });

      // Replace {displayName} in workflows
      const workflows = [
        ".github/workflows/test.yml",
        ".github/workflows/publish.yml",
      ];
      workflows.forEach((workflow) => {
        const workflowPath = this.destinationPath(extensionName, workflow);
        if (this.fs.exists(workflowPath)) {
          let content = this.fs.read(workflowPath);
          content = content.replace(/{displayName}/g, displayName);
          this.fs.write(workflowPath, content);
        }
      });
  }

  install() {
    const extensionName = this.extensionConfig.name;

    // Update the package.json
    const packageJsonPath = this.destinationPath(extensionName, "package.json");
    const packageJson = this.fs.readJSON(packageJsonPath);
    packageJson.scripts = {
      ...packageJson.scripts,
      "test:coverage":
        "vscode-test --label 0 --coverage --coverage-reporter json-summary --coverage-output coverage/coverage-summary",
      "docker:build-test":
        "docker build -f .docker/test/dockerfile --pull=false -t act-test-ubuntu-node .",
      "act:test":
        'act --pull=false --workflows ".github/workflows/test.yml" --secret-file "" --var-file "" --input-file "" --eventpath ""',
      "vscode:download": "node ./scripts/vscode_downloader.js",
    };
    this.fs.writeJSON(packageJsonPath, packageJson);
  }
};
