const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  initializing() {
    this.log(`
      _-----_     ╭──────────────────────────╮
     |       |    │ Setup you Visual Studio  │
     |--(o)--|    │   Code Extension +       │
    '---------´   │    Github Workflows      │
     ( _'U'_ )    ╰──────────────────────────╯
     /___A___\   /
      |  ~  |
    __'.___.'__
  '   '  |° ' Y '
    `);
  }

  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "extensionName",
        message: "Your VS Code extension name",
        default: this.appname, // Default to current folder name
        validate: (input) => (input ? true : "Extension name is required."), // Make appname required
      },
    ]).then((answers) => {
      this.extensionName = answers.extensionName;
      return this.prompt([
        {
          type: "input",
          name: "displayName",
          message: `Your VS Code extension display name (${answers.extensionName})`,
          default: answers.extensionName, // Default display name to extensionName
        },
        {
          type: "input",
          name: "description",
          message: "Your VS Code extension description",
          default: "My Visual Studio Code extension", // Default description
        },
        {
          type: "confirm",
          name: "initializeGit",
          message: "Would you like to initialize a git repository?",
          default: false, // Default to no
        },
      ]).then((secondAnswers) => {
        this.displayName = secondAnswers.displayName;
        this.description = secondAnswers.description;
        this.initializeGit = secondAnswers.initializeGit;
      });
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("**/*"),
      this.destinationPath(this.extensionName),
      { extensionName: this.extensionName },
      {},
      { globOptions: { dot: true } } // Include hidden files and directories
    );

    // Update displayName in package.json
    const packageJsonPath = this.destinationPath(
      this.extensionName,
      "package.json"
    );
    const packageJson = this.fs.readJSON(packageJsonPath);
    packageJson.name = this.appname;
    packageJson.displayName = this.displayName;
    packageJson.description = this.description;
    this.fs.writeJSON(packageJsonPath, packageJson);

    // Replace {displayName} in workflows
    const workflows = [".github/workflows/test.yml", ".github/workflows/publish.yml"];
    workflows.forEach((workflow) => {
      const workflowPath = this.destinationPath(this.extensionName, workflow);
      if (this.fs.exists(workflowPath)) {
        let content = this.fs.read(workflowPath);
        content = content.replace(/{displayName}/g, this.displayName);
        this.fs.write(workflowPath, content);
      }
    });
  }

  install() {
    return this.prompt([
      {
        type: "confirm",
        name: "runNpmInstall",
        message: "Would you like to run npm install?",
        default: true,
      },
    ]).then((answers) => {
      if (answers.runNpmInstall) {
        this.log(
          "Running npm install for you to install the required dependencies."
        );

        this.spawnCommandSync("npm", ["install"], {
          cwd: this.destinationPath(this.extensionName),
        });
      } else {
        this.log(
          "Skipping npm install. You can run it later in the project directory."
        );
      }

      if (this.initializeGit) {
        this.spawnCommandSync("git", ["init"], {
          cwd: this.destinationPath(this.extensionName),
        });
      }
    });
  }

  end() {
    this.log("Your VS Code extension project has been successfully created!");

    return this.prompt([
      {
        type: "confirm",
        name: "openInVSCode",
        message: "Would you like to open the project in VS Code?",
        default: true,
      },
    ]).then((answers) => {
      if (answers.openInVSCode) {
        this.spawnCommandSync("code", [
          this.destinationPath(this.extensionName),
        ]);
      }
    });
  }
};
