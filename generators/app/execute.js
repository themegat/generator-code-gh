const _ = require("lodash");
const fs = require("fs");
const path = require("path");

module.exports = class Execute {
  constructor() {}

  static copyFilesAndDirectories(generator, extensionName, directoriesToCopy) {
    directoriesToCopy.forEach((dir) => {
      generator.fs.copy(
        generator.templatePath(dir),
        generator.destinationPath(extensionName, dir)
      );
    });
  }

  static updateDockerFile(generator, extensionName, pkgManager) {
    const filePath = generator.destinationPath(
      extensionName,
      ".docker/test.dockerfile"
    );
    if (generator.fs.exists(filePath)) {
      let content = generator.fs.read(filePath);
      content = content.replace(/{pkgManager}/g, pkgManager);
      fs.writeFileSync(filePath, content);
    }
  }

  static copyWorkflows(generator, extensionName, workflows, displayName) {
    workflows.forEach((workflow) => {
      const workflowPath = generator.destinationPath(extensionName, workflow);
      if (generator.fs.exists(workflowPath)) {
        let content = generator.fs.read(workflowPath);
        content = content.replace(/{displayName}/g, displayName);
        generator.fs.write(workflowPath, content);
      }
    });
  }

  static updatePackageJson(generator, extensionName, displayName, all) {
    const scriptsPath = path.join(
      generator.templatePath(),
      "..",
      "./scripts.json"
    );
    const scripts = generator.fs.read(scriptsPath);
    const scriptsContent = JSON.parse(scripts);
    const pkgJson = {
      displayName: displayName,
      scripts: {
        ...scriptsContent["scripts-workflow"],
        ...(all ? scriptsContent["scripts-act"] : undefined),
      },
    };
    const packageJsonContent = generator.fs.readJSON(
      generator.destinationPath(extensionName, "package.json")
    );
    const newPackageJsonContent = _.merge(packageJsonContent, pkgJson);
    fs.writeFileSync(
      generator.destinationPath(extensionName, "package.json"),
      JSON.stringify(newPackageJsonContent, null, 4)
    );
  }
};
