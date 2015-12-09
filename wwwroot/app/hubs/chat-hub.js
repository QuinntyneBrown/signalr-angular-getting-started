(function () {
    "use strict";

    function chatHub($) {
        var self = this;
        self.$ = $;
        self.started = false;
        self._instance = null;
        self.getInstance = function () {
            if (!self._instance) {
                self.connection = self.$.hubConnection();
                self._instance = self.connection.createHubProxy("chatHub");
                self.connection.start({ transport: 'longPolling' }, function () {

                });
            } 
            return self._instance;
        }

        return self;
    }

    angular.module("app").service("chatHub", ["$", chatHub]);
})();