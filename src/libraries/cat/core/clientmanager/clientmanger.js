_cat.core.clientmanager = function () {

    var tests,
        commitScrap,
        getScrapTestInfo,
        totalDelay,
        runStatus,
        checkIfExists,
        updateTimeouts,
        catConfig,
        startInterval,
        delayManagerCommands,
        getScrapInterval,
        setupInterval,
        intervalObj,
        endTest,
        testQueue = {},
        currentState = { index: 0 };

    endTest = function (opt, interval) {

        _cat.core.TestManager.send({signal: 'TESTEND', error: opt.error});
        if (interval === -1) {
            console.log("Test End");
        } else {
            clearInterval(interval);
        }
    };

    runStatus = {
        "scrapReady": 0,
        "subscrapReady": 0,
        "numRanSubscrap": 0,
        "scrapsNumber": 0

    };

    getScrapInterval = function (scrap) {
        var scrapId = scrap.id;

        if (!runStatus.intervalObj) {
            runStatus.intervalObj = {
                "interval": undefined,
                "counter": 0,
                "signScrapId": scrapId
            };
        } else {
            runStatus.intervalObj.signScrapId = scrapId;
        }

        if (intervalObj) {
            clearInterval(intervalObj.interval);
        }
        
        return runStatus.intervalObj;
    };


    setupInterval = function (config, scrap) {
        
        var tests,            
            testManager;
        
        intervalObj = getScrapInterval(scrap);
        
        tests = config.getTests();
        if (tests) {
            testManager = (tests[tests.length - 1].name || "NA");
        }


        intervalObj.interval = setInterval(function () {

            var msg = ["No test activity, retry: "];
            if (intervalObj.counter < 3) {
                intervalObj.counter++;

                msg.push(intervalObj.counter);
                
                _cat.core.ui.setContent({
                    header: "Test Status",
                    desc: msg.join(""),
                    tips: {},
                    style: "color:gray"
                });
                
                console.log("[CatJS manager] ", msg.join(""));

            } else {
                var err = "run-mode=tests catjs manager '" + testManager + "' is not reachable or not exists, review the test name and/or the tests code.";

                console.log("[CatJS Error] ", err);
                endTest({error: err}, (runStatus ? runStatus.intervalObj : undefined));
                clearInterval(intervalObj.interval);
            }
        }, config.getTimeout() / 3);
        
        return;
    };


    commitScrap = function (scrap, args) {
        var scrapInfo,
            repeat,
            scrapInfoArr,
            infoIndex,
            repeatIndex,
            size;

        scrapInfoArr = getScrapTestInfo(scrap.name);
        size = scrapInfoArr.length;
        for (infoIndex = 0; infoIndex < size; infoIndex++) {
            scrapInfo = scrapInfoArr[infoIndex];
            repeat = scrapInfo.repeat || 1;
            for (repeatIndex = 0; repeatIndex < repeat; repeatIndex++) {
                _cat.core.actionimpl.apply(this, args);
            }
        }
    };


    getScrapTestInfo = function (scrapName) {
        var scrapTests = [],
            i, size,
            validate = 0,
            tempInfo,
            reportFormats;

        if (tests && scrapName) {
            size = tests.length;
            for (i = 0; i < size; i++) {

                if (tests[i].name === scrapName) {
                    tempInfo = {"name": tests[i].name,
                        "scenario": tests[i].scenario,
                        "wasRun": tests[i].wasRun,
                        "delay": tests[i].delay,
                        "repeat": tests[i].repeat};
                    tempInfo.index = i;
                    scrapTests.push(tempInfo);
                    validate++;
                }
            }
        }

        if (!validate) {
            console.warn("[CatJS] Failed to match a scrap with named: '" + scrapName + "'. Check your cat.json project");
            if (!_cat.core.ui.isOpen()) {
                _cat.core.ui.on();
            }
        }
        return scrapTests;
    };

    checkIfExists = function (scrapName, tests) {

        var indexScrap = 0, size = (tests && tests.length ? tests.length : 0),
            testitem;

        for (; indexScrap < size; indexScrap++) {
            testitem = tests[indexScrap];
            if (testitem && testitem.name === scrapName) {
                return true;
            }
        }
        return false;
    };

    totalDelay = 0;

    updateTimeouts = function (scrap) {
        var scrapId = scrap.id;
        if (runStatus.intervalObj && (scrapId !== runStatus.intervalObj.signScrapId)) {
            runStatus.intervalObj.signScrapId = scrapId;
            runStatus.intervalObj.counter = 0;
        }
    };

    startInterval = function (catConfig, scrap) {
        setupInterval(catConfig, scrap);
    };

    delayManagerCommands = function (commands, context) {

        var indexCommand = 0,
            catConfig = _cat.core.getConfig(),
            _enum = catConfig.getTestsTypes(),
            executeCode,
            delay = catConfig.getTestDelay();

        executeCode = function (codeCommandsArg, context) {
            var commandObj,
                scrap = context.scrap,
                size = (codeCommandsArg ? codeCommandsArg.length : undefined),
                functionargskeys = [],
                functionargs = [],
                contextkey;


            updateTimeouts(scrap);

            for (indexCommand = 0; indexCommand < size; indexCommand++) {
                commandObj = codeCommandsArg[indexCommand];

                if (commandObj) {
                    functionargskeys.push("context");
                    functionargs.push(context);
                    
                    if (context && context.args) {
                        for (contextkey in context.args) {
                            if (context.args.hasOwnProperty(contextkey)) {
                                functionargskeys.push(contextkey);
                                functionargs.push(context.args[contextkey]);
                            }
                        }
                    }
                    

                        if (_cat.utils.Utils.getType(commandObj) === "string") {
                            commandObj = (commandObj ? commandObj.trim() : undefined);                        
                            new Function(functionargskeys.join(","), "return " + commandObj).apply(this, functionargs);
    
                        } else if (_cat.utils.Utils.getType(commandObj) === "function") {
                            commandObj.apply(this, functionargs);
                        }
                    }

                } else {
                    console.warn("[CatJS] Ignore, Not a valid command: ", commandObj);
                }
            }

            runStatus.numRanSubscrap = runStatus.numRanSubscrap + size;

            if ((runStatus.numRanSubscrap === runStatus.subscrapReady) && runStatus.scrapReady === runStatus.scrapsNumber) {
                var reportFormats;
                if (catConfig.isReport()) {
                    reportFormats = catConfig.getReportFormats();
                }

                // TODO change clear interval
                endTest({reportFormats: reportFormats}, (runStatus.intervalObj ? runStatus.intervalObj.interval : undefined));
            }

        };

        runStatus.subscrapReady = runStatus.subscrapReady + commands.length;

        if ((catConfig) && (catConfig.getRunMode() === _enum.TEST_MANAGER)) {
            setTimeout(function () {
                executeCode(commands, context);
            }, totalDelay);
            totalDelay += delay;
        } else {
            executeCode(commands, context);
        }

    };
    
    return {



        signScrap: function (scrap, catConfig, args, _tests) {
            var urlAddress,
                config;
            runStatus.scrapsNumber = _tests.length;
            tests = _tests;

            startInterval(catConfig, scrap);

            if (checkIfExists(scrap.name[0], tests)) {

                urlAddress = "http://" + catConfig.getIp() + ":" + catConfig.getPort() + "/scraps?scrap=" + scrap.name[0] + "&" + "testId=" + _cat.core.guid();

                config = {
                    url: urlAddress,
                    callback: function () {

                        var response = JSON.parse(this.responseText),
                            scraplist;

                        function _process(config) {
                            var scrap = config.scrapInfo,
                                args = config.args;

                            if (scrap) {
                                runStatus.scrapReady = parseInt(scrap ? scrap.index : 0) + 1;
                                commitScrap(scrap, args);
                            }
                        }

                        function _add2Queue(config) {
                            config.args = args;
                            if (args.length && args.length > 1 && (_cat.utils.Utils.getType(args[1]) === "object") ) {
                                args[1].scrapinfo = config.scrapInfo;
                            }
                            testQueue[config.scrapInfo.index] = config;
                        }

                        function _processReadyScraps() {

                            var idx = currentState.index;
                            if (testQueue[idx]) {
                                var config = testQueue[idx];
                                if (config) {
                                    _process(config);
                                    testQueue[idx] = undefined;
                                    currentState.index++;
                                    _processReadyScraps();
                                }

                            }

                        }

                        if (response.ready) {
                            scraplist = response.readyScraps;
                            if (scraplist) {
                                scraplist.forEach(function (scrap) {
                                    var config = testQueue[scrap.index];
                                    if (config) {
                                        // already in queue;

                                    } else {
                                        _add2Queue({scrapInfo: scrap, args: args});
                                    }

                                });
                            }
                        } else {

                            _add2Queue({scrapInfo: response.scrapInfo, args: args});
                        }

                        _processReadyScraps();
                    }
                };

                _cat.utils.AJAX.sendRequestAsync(config);
            }

        },

        /**
         * Delay a set of UI actions commands
         * 
         * Config:
         *       methods {Array} string javascript functions reference
         *       commands {Array} string javascript statements
         *       context {Object} catjs context object
         *
         * 
         * @param config
         */
        delayManager: function (config) {
            var codeCommands, context, methods, commands = [];            
            
            (function init() {
                if (config) {
                    codeCommands = ("commands" in config ? config.commands : undefined);
                    methods = ("methods" in config ? config.methods : undefined);
                    context = ("context" in config ? config.context : undefined); 
                }
            })();

            commands = commands.concat((codeCommands || []));
            commands = commands.concat((methods || []));            
            
            delayManagerCommands(commands, context);
        }
    };
}();