(function () {
    "use strict";

    function chatHub($,dispatcher) {
        var self = this;
        self.$ = $;
        self.dispatcher = dispatcher;
        self.started = false;
        self._instance = null;
        self.getInstance = function () {
            if (!self._instance) {
                self.connection = self.$.hubConnection();
                self._instance = self.connection.createHubProxy("chatHub");
                self.connection.start({ transport: 'longPolling' }, function () {
                    self.started = true;
                    self.dispatcher.emit({ actionType: "CHAT_HUB_STARTED" });
                });
            } 
            return self._instance;
        }

        return self;
    }

    angular.module("app").service("chatHub", ["$", "dispatcher", chatHub]);
})();