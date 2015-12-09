(function () {

    function chatStore(dispatcher, CHAT_ACTIONS, chatHub, store) {
        var self = this;
        self._storeInstance = null;
        self.dispatcher = dispatcher;
        self.store = store;
        self.chatHub = chatHub.getInstance();

        self.chatHub.on("broadcastMessage", function (options) {
            self.storeInstance.emitChange({ options: options });
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

        return self;
    }


    angular.module("app").service("chatStore",["dispatcher", "CHAT_ACTIONS", "chatHub","store", chatStore])
    .run(["chatStore", function (chatStore) { }]);
})();