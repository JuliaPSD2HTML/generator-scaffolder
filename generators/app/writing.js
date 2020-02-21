const fs = require('fs');
const path = require('path');
const merge = require('lodash.merge');
const {PROMPTS_VALUES, packages, globals} = require('./globals');
const config = require('./templates/base/config.json');

const projectConfig = 'markup/config.json';
const pkg = 'markup/package.json';

module.exports = async function writeFiles() {
  const copyFiles = paths => {
    paths.forEach(files => {
      this.fs.copy(this.templatePath(files[0]), this.destinationPath(files[1]), {
        globOptions: {
          dot: true,
        }
      });
    });

    
  };

  const modifyConfig = (settings, config = projectConfig) => {
    this.fs.extendJSON(this.destinationPath(config), settings);
  }

  const setLinters = () => {
    if (this.props.linters && this.props.linters.length) {
      const lintCSS = this.props.linters.includes(PROMPTS_VALUES.linters.css);
      const lintJS = this.props.linters.includes(PROMPTS_VALUES.linters.js);
      const lintersSettings = {
        linters: {
          css: lintCSS,
          js: lintJS,
        }
      }

      copyFiles([['linters/general', globals.destination]]);
      modifyConfig(lintersSettings)

      if (lintCSS) {
        const cssLinterPackages = merge(packages.linters.general, packages.linters.css);
        copyFiles([['linters/css', globals.destination]]);
        modifyConfig(cssLinterPackages, pkg);
      }

      if (lintJS) {
        const jsLinterPackages = merge(packages.linters.general, packages.linters.js);
        copyFiles([['linters/js', globals.destination]]);
        modifyConfig(jsLinterPackages, pkg);
      }
    } else {
      const noLinters = {
        linters: false,
      }

      modifyConfig(noLinters);
    }
  };

  const setProjectTypeBasedSettings = () => {
    const WP = {
      config: {
        styles: {
          bundle: 'style',
          dest: './',
        }
      },
    }

    if (this.props.cms === PROMPTS_VALUES.cms.wp) {
      modifyConfig(WP.config);
    }
  }

  const setFrontendFrameworks = () => {
    switch(this.props.framework) {
      case PROMPTS_VALUES.framework.bootstrap:
        modifyConfig(packages.frameworks.bootstrap, pkg);
        copyFiles([['bootstrap', globals.destination]]);
        break;
      case PROMPTS_VALUES.framework.zurb:
        modifyConfig(packages.frameworks.zurb, pkg);
        copyFiles([['zurb', globals.destination]]);
        break;
      case PROMPTS_VALUES.framework.materialize:
        modifyConfig(packages.frameworks.materialize, pkg);
        copyFiles([['materialize', globals.destination]]);
        break;
      default:
        return;
    }
  }


  await Promise.all([
    copyFiles([['base', globals.destination]]),
    setLinters(),
    setProjectTypeBasedSettings(),
    setFrontendFrameworks(),
  ])
};