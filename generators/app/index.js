const Generator = require("yeoman-generator");
const Prompts = require("./prompts");
const Execute = require("./execute");

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
      this.extensionConfig.installDependencies = false;
    });
  }

  async _buildActImage() {
    try {
      const extensionName = this.extensionConfig.name;
      const executionPath = this.destinationPath(extensionName);
      await this.spawnCommandSync("docker", ["--version"]);
      this.log("Docker is installed. Building the image...");
      await this.spawnCommandSync("npm", ["run", "-t", "docker:build-test"], {
        cwd: executionPath,
      });
    } catch (error) {
      this.log("Docker is either not running or not installed. Skipping image build.");
      this.log.error(
        "Start or install Docker then run `npm run docker:build-test` in the project root."
      );
    }
  }

  _writing(displayName, configAct) {
    this.extensionConfig.displayName = displayName;
    this.extensionConfig.configAct = configAct;

    // Access the extensionName stored in the prompting phase
    const extensionName = this.extensionConfig.name;
    const _displayName = this.extensionConfig.displayName;

    // Copy the .actrc file and .docker .scripts directories and their contents
    const directoriesToCopy = [".github"];
    if (configAct) {
      directoriesToCopy.push(".docker", ".actrc");
    }
    Execute.copyFilesAndDirectories(this, extensionName, directoriesToCopy);

    // Copy the GitHub Actions workflow files and overwrite the placeholders
    const workflows = [
      ".github/workflows/test.yml",
      ".github/workflows/publish.yml",
    ];
    Execute.copyWorkflows(this, extensionName, workflows, _displayName);
  }

  writing() {
    return this.prompt([Prompts.askForGitWorkflowConfig()]).then((answers) => {
      this.extensionConfig.configGithubWorkflows =
        answers.configGithubWorkflows;
      if (answers.configGithubWorkflows) {
        return this.prompt([
          Prompts.askForDisplayName(this.extensionConfig.displayName),
          Prompts.askForActConfig(),
          Prompts.askToRunPkgInstall(this.extensionConfig.pkgManager),
        ]).then((answers) => {
          const displayName = answers.displayName;
          this.env.options.skipInstall = true;
          this.extensionConfig.runPkgInstall = answers.runPkgInstall;
          const configAct = answers.configAct;
          if (configAct) {
            return this.prompt([Prompts.askToBuildActImage()]).then(
              (answers) => {
                this.extensionConfig.buildActImage = answers.buildActImage;
                this._writing(displayName, configAct);
              }
            );
          } else {
            this._writing(displayName, configAct, false);
          }
        });
      } else {
        return this.prompt([
          Prompts.askToRunPkgInstall(this.extensionConfig.pkgManager),
        ]).then((answers) => {
          this.env.options.skipInstall = true;
          this.extensionConfig.runPkgInstall = answers.runPkgInstall;
        });
      }
    });
  }

  async install() {
    const extensionName = this.extensionConfig.name;
    if (this.extensionConfig.configGithubWorkflows) {
      const displayName = this.extensionConfig.displayName;
      const configAct = this.extensionConfig.configAct ?? false;
      // Update the package.json
      Execute.updatePackageJson(this, extensionName, displayName, configAct);
    }
    if (this.extensionConfig.configAct) {
      Execute.updateDockerFile(
        this,
        extensionName,
        this.extensionConfig.pkgManager
      );
    }
    if (this.extensionConfig.runPkgInstall) {
      this.log(`Running ${this.extensionConfig.pkgManager} install ...`);
      await this.spawnCommandSync(
        this.extensionConfig.pkgManager,
        ["install"],
        {
          cwd: this.destinationPath(extensionName),
        }
      );
    }
    if (this.extensionConfig.buildActImage) {
      this._buildActImage();
    }
  }
};
