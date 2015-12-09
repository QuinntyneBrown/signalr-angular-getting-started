(function () {

    "use strict";

    function userStore(dispatcher, USER_ACTIONS, store) {
        var self = this;
        self._storeInstance = null;
        self.dispatcher = dispatcher;
        self.store = store;
        
        self.dispatcher.addListener({
            actionType: USER_ACTIONS.REGISTER,
            callback: function (options) {
                self.currentUser = options.data;
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

        self.currentUser = null;

        return self;
    }

    angular.module("app").service("userStore", ["dispatcher", "USER_ACTIONS", "store", userStore])
    .run(["userStore", function (userStore) { }]);
})();