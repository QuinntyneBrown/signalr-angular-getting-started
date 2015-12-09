(function () {

    function chatStore(chatHub, store) {
        var self = this;
        self._storeInstance = null;
        self.store = store;
        self.chatHub = chatHub.getInstance();

        self.chatHub.on("broadcastMessage", function (results) {
            self.storeInstance.addOrUpdate({ data: results });
            self.storeInstance.emitChange();
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

        Object.defineProperty(self, "items", { "get": function () { return self.storeInstance.items; } });

        return self;
    }


    angular.module("app").service("chatStore",["chatHub","store", chatStore])
    .run(["chatStore", function (chatStore) { }]);
})();