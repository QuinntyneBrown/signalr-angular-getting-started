(function () {

    "use strict";

    function chatActions(chatHub) {
        var self = this;
        self.chatHubInstance = chatHub.getInstance();
        self.send = function (options) {
            self.chatHubInstance.invoke("send", options.username, options.message);
        }
        return self;
    }

    angular.module("app").service("chatActions", ["chatHub",chatActions]);

})();