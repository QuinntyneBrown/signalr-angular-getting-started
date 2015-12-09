'use strict';

var GulpConfig = (function () {

    function GulpConfig() {
        this.source = './wwwroot/';
        this.allJavaScript = this.source + '/**/*.js';
        this.allFiles = this.source + '/**/*.js';
    }

    return GulpConfig;
})();

module.exports = GulpConfig;