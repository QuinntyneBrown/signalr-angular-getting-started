(function () {

    "use strict";

    function userStore(dispatcher, localStorageManager, securityStore, store, USER_ACTIONS) {
        var self = this;
        self._storeInstance = null;
        self.dispatcher = dispatcher;
        self.store = store;
        self.securityStore = securityStore;
        
        self.dispatcher.addListener({
            actionType: USER_ACTIONS.REGISTER,
            callback: function (options) {
                self.securityStore.currentUser = options.data;
                self.securityStore.token = "DUMMY_AUTH_TOKEN";
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

        Object.defineProperty(self, "currentUser", {
            "get": function () { return self.securityStore.currentUser; }
        });

        return self;
    }

    angular.module("app").service("userStore", ["dispatcher", "localStorageManager", "securityStore", "store", "USER_ACTIONS", userStore])
    .run(["userStore", function (userStore) { }]);
})();