module.exports = class Prompts {
  constructor() {}

  static askForDisplayName(defaultValue) {
    return {
      type: "input",
      name: "displayName",
      message: "What's the display name of your extension?",
      default: defaultValue,
    };
  }

  static askToRunPkgInstall(pkgManager) {
    return {
      type: "confirm",
      name: "runPkgInstall",
      message: `Would you like to run ${pkgManager} install?`,
      default: true,
    };
  }

  static askForGitWorkflowConfig() {
    return {
      type: "confirm",
      name: "configGithubWorkflows",
      message: "Would you like to configure Github workflows?",
      default: true,
    };
  }

  static askForActConfig() {
    return {
      type: "confirm",
      name: "configAct",
      message: "Would you like to use the custom image for Nektos/act?",
      default: true,
    };
  }

  static askToBuildActImage() {
    return {
      type: "confirm",
      name: "buildActImage",
      message: "Would you like build the image now?",
      default: true,
    };
  }
};
