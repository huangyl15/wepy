const path = require('path');


exports = module.exports = function () {

  this.register('build-components', function buildComponents (comps) {
    this.logger.info('component', 'building components');

    comps.forEach(comp => {
      let { script, styles, config, template, wxs } = comp.sfc;

      let styleCode = '';
      styles.forEach(v => {
        styleCode += v.parsed.code + '\n';
      });

      config.parsed.output.component = true;
      config.outputCode = JSON.stringify(config.parsed.output, null, 4);

      this.hookSeq('script-dep-fix', script.parsed);
      if (!script.empty && !comp.wxComponent) {
        this.hookSeq('script-injection', script.parsed, template.parsed.rel);
      }
      script.outputCode = script.parsed.source.source();
      styles.outputCode = styleCode;
      template.outputCode = template.parsed.code;

      if (wxs && wxs.length) {
        let wxsCode = '';
        wxs.forEach(item => {
          wxsCode += item.parsed.output + '\n';
        });
        template.outputCode =
          '<!----------   wxs start ----------->\n' +
          wxsCode +
          '<!----------   wxs end   ----------->\n' +
          template.outputCode;
      }
      let targetFile = comp.npm ? this.getModuleTarget(comp.file) : this.getTarget(comp.file);
      let target = path.parse(targetFile);
      comp.outputFile = path.join(target.dir, target.name);
    });

    return comps;
  });
};

