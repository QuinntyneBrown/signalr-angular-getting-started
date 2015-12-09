'use strict';

var GulpConfig = (function () {

    function GulpConfig() {
        this.source = './wwwroot/';
        this.allJavaScript = this.source + '/**/*.js';
        this.allFiles = this.source + '/**/*.js';

        this.paths = {
            npm: './node_modules/',
            lib: './libs/'
        };

        this.libs = [
            this.paths.npm + 'angular/angular.js',
            this.paths.npm + 'angular-route/angular-route.js',
            this.paths.npm + 'jquery/dist/jquery.js',
            this.paths.npm + 'ngX/dist/ngX.js'
        ];
    }

    return GulpConfig;
})();

module.exports = GulpConfig;