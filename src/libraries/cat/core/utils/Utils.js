if (typeof(_cat) !== "undefined") {

    _cat.utils.Utils = function () {

        return {

            querystring: function(name, query){
                var re, r=[], m;

                re = new RegExp('(?:\\?|&)' + name + '=(.*?)(?=&|$)','gi');
                while ((m=re.exec(query  || document.location.search)) != null) {
                    r[r.length]=m[1];
                }
                return (r && r[0] ? r[0] : undefined);
            },

            getType: function (obj) {
                return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();

            },

            getMatchValue: function (pattern, text) {

                var regexp = new RegExp(pattern),
                    results;

                if (regexp) {
                    results = regexp.exec(text);
                    if (results &&
                        results.length > 1) {
                        return results[1];
                    }
                }

                return results;

            },

            /**
             * Validates an object and availability of its properties
             *
             */
            validate: function (obj, key, val) {
                if (obj) {

                    // if key is available
                    if (key !== undefined) {

                        if (key in obj) {

                            if (obj[key] !== undefined) {

                                if (val !== undefined) {
                                    if (obj[key] !== val) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                        }

                        return false;


                    } else {

                        return true;
                    }

                }

                return false;
            }
        };

    }();


} else {

    var _cat = {
        utils:{
            Utils:{}
        }
    };

}
_cat.utils.Utils.generateGUID = function () {

    //GUID generator
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    function guid() {
        return [S4(),S4(),"-",S4(),"-",S4(),"-",S4(),"-",S4(),S4(),S4()].join("");
    }

    return guid();
};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        // nodejs support

        module.exports.generateGUID = _cat.utils.Utils.generateGUID;

    }
}

