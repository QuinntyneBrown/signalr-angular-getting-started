(function () {

    "use strict";

    angular.module("app").value("CHAT_ACTIONS", {
        SEND: "SEND"
    });

    function chatActions(CHAT_ACTIONS, chatHub, dispatcher, guid) {
        var self = this;
        self.CHAT_ACTIONS = CHAT_ACTIONS;
        self.dispatcher = dispatcher;
        self.guid = guid;
        self.chatHubInstance = chatHub.getInstance();

        self.send = function (options) {
            var newGuid = self.guid();
            self.chatHubInstance.invoke("send", options.username, options.message);
            return newGuid;
        }

        return self;
    }

    angular.module("app").service("chatActions", ["CHAT_ACTIONS","chatHub","dispatcher","guid",chatActions]);

})();