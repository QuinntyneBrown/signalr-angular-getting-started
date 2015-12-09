(function () {

    "use strict";

    angular.module("app", ["ngX"]).config(["$routeProvider", function ($routeProvider) {

        $routeProvider.when("/chat", {
            "componentName": "chatComponent"
        });

        $routeProvider.when("/", {
            "componentName": "registerComponent"
        });

    }]);



})();