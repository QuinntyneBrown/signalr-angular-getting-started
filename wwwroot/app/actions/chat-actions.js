(function () {

    "use strict";

    angular.module("app").value("CHAT_ACTIONS", {
        SEND: "SEND",
        REGISTER: "REGISTER"
    });

    function chatActions(CHAT_ACTIONS, dispatcher, guid) {
        var self = this;
        self.CHAT_ACTIONS = CHAT_ACTIONS;
        self.dispatcher = dispatcher;
        self.guid = guid;

        self.send = function (options) {
            var newGuid = self.guid();

            return newGuid;
        }

        self.register = function (options) {
            var newGuid = self.guid();

            return newGuid;
        }

        return self;
    }

    angular.module("app").service("chatActions", ["CHAT_ACTIONS","dispatcher","guid",chatActions]);

})();