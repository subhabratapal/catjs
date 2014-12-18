var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log(),
    _path = require("path"),
    _props = catrequire("cat.props"),
    _basePlugin = catrequire("cat.plugin.base"),
    _utils = catrequire("cat.utils"),
    _fs = require("fs.extra"),
    _typedas = require("typedas"),
    _Scrap = catrequire("cat.common.scrap"),
    _beautify = require('js-beautify').js_beautify;

module.exports = _basePlugin.ext(function () {

    var _emitter,
        _global,
        _data,
        _internalConfig,
        _project,
        _me = this;

    return {

        /**
         *  Initial plugin function
         *
         * @param config The configuration:
         *          data - The configuration data
         *          emitter - The emitter reference
         *          global - The global data configuration
         *          internalConfig - CAT internal configuration
         */
        init: function (config) {

            var scraps,
                extensionParams,
                errors = ["[libraries plugin] No valid configuration"],
                workDir = _catglobal.get("home").working.path,
                catjson, catjsondata, args=[],
                filedata;

            if (!config) {
                _log.error(errors[1]);
                _me.setDisabled(true);
            }

            _emitter = config.emitter;
            _global = config.global;
            _data = config.data;
            _internalConfig = config.internalConfig;
            _project = (_internalConfig ? _internalConfig.getProject() : undefined);

            // initial data binding to 'this'
            _me.dataInit(_data);
            extensionParams = _data.data;

            if (config && extensionParams) {

                //customAttribute = extensionParams.customAttribute;
                scraps = _Scrap.getScraps();
                if (scraps) {

                    scraps.forEach(function(scrap) {
                        console.log(scrap.get("$standalone"));
                        if (scrap && scrap.get("auto") && !scrap.get("$standalone")) {
                            args.push({"name":scrap.get("name")});
                        }
                    });

                    catjson = (workDir ? _path.join(_project.getInfo("source"), "config/cat.json") : undefined);
                    if (catjson) {
                        if (_fs.existsSync(catjson)) {
                            catjsondata = _fs.readFileSync(catjson, "utf8");
                            if (catjsondata) {
                                catjsondata = JSON.parse(catjsondata);
                                if (catjsondata.scenarios.general.tests && catjsondata.tests) {
                                    catjsondata.scenarios.general.tests = args;
                                }
                            }
                            catjsondata["run-mode"] = "tests";
                        }
                    }

                    filedata = JSON.stringify(catjsondata);
                    if (filedata) {

                        try {
                            filedata = _beautify(filedata, { indent_size: 2 });
                            _fs.writeFileSync(catjson, filedata);
                        } catch(e) {
                            _utils.error("[CAT autotest] Error occurred while writing the configuration data. Error: ", e);
                        }
                    }

                }
            }

            // done processing notification for the next task to take place
            _emitter.emit("job.done", {status: "done"});

        },
        /**
         * Validate the plugin
         *
         *      dependencies {Array} The array of the supported dependencies types
         *
         * @returns {{dependencies: Array}}
         */
        validate: function() {
            return { dependencies: ["manager"]};
        }

    };

});