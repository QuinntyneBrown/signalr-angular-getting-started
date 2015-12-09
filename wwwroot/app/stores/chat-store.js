(function () {

    function chatStore($, dispatcher, CHAT_ACTIONS, store) {

        var self = this;
        self._storeInstance = null;
        self.dispatcher = dispatcher;
        self.store = store;
        self.$ = $;
        self.connection = self.$.hubConnection();
        self.hub = self.connection.createHubProxy("chatHub");
        self.hub.on("onMessageAdded", function (options) {
            self.storeInstance.addOrUpdate({ data: options });
            self.storeInstance.emitChange();
        });
        self.connection.start({ transport: 'longPolling' }, function () {

        });

        self.dispatcher.addListener({
            actionType: CHAT_ACTIONS.REGISTER,
            callback: function (options) {
                self.storeInstance.addOrUpdate({ data: options.data });
                self.storeInstance.emitChange({ id: options.id });
            }
        });

        self.dispatcher.addListener({
            actionType: CHAT_ACTIONS.SEND,
            callback: function (options) {
                self.storeInstance.addOrUpdate({ data: options.data });
                self.storeInstance.emitChange({ id: options.id });
            }
        });

        Object.defineProperty(self, "storeInstance", {
            "get": function () {
                if (!self._storeInstance) {
                    self._storeInstance = self.store.createInstance();
                    return self._storeInstance;
                }
                else {
                    return self._storeInstance;
                }
            }
        });

        Object.defineProperty(self, "items", {
            "get": function () { return self.storeInstance.items; }
        });

        self.getById = function (id) {
            return self.storeInstance.getById(int);
        }
        return self;
    }


    angular.module("app").service(["$", "dispatcher", "CHAT_ACTIONS", "store", chatStore]);
})();