(function () {

    "use strict";

    angular.module("app", ["ngX"]).config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/chat", {
            "componentName": "chatComponent",
            "autorizationRequired": true
        });
        $routeProvider.when("/", {
            "componentName": "registerComponent"
        });
    }]);
})();
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
(function () {

    "use strict";

    angular.module("app").value("USER_ACTIONS", {
        REGISTER: "REGISTER"
    });

    function userActions(USER_ACTIONS, dispatcher, guid) {
        var self = this;
        self.USER_ACTIONS = USER_ACTIONS;
        self.dispatcher = dispatcher;
        self.guid = guid;

        self.register = function (options) {
            var newGuid = self.guid();
            self.dispatcher.emit({
                actionType: self.USER_ACTIONS.REGISTER, options: {
                    id: options ? options.id : null,
                    data: options ? options.data :null
                }
            })
            return newGuid;
        }

        return self;
    }

    angular.module("app").service("userActions", ["USER_ACTIONS", "dispatcher", "guid", userActions]);

})();
(function () {

    "use strict";

    ngX.Component({
        selector: "app",
        component: function AppComponent() {
        },
        template: [
            "<div class='app'>",
            "   <div class='mainContent' data-ng-view>",
            "   </div>",
            "</div>"
        ].join(" ")
    });
})();
(function () {

    "use strict";

    function ChatComponent(chatActions, userStore) {
        var self = this;
        self.chatActions = chatActions;
        self.currentUser = userStore.currentUser;
        self.message = null;      
        self.send = function () {
            self.chatActions.send({ username: self.currentUser.username, message: self.message });
            self.message = null;
        }
        return self;
    }

    ngX.Component({
        component: ChatComponent,
        route: "/chat",
        providers: ["chatActions", "userStore"],
        template: [
            "<div class='chatComponent'>",

            "   <div>",
            "       <input placeholder='Enter Message' type='text' data-ng-model='vm.message' /> ",
            "       <button data-ng-click='vm.send()'>Submit</button> ",
            "   </div>",

            "   <message-list></message-list>",

            "</div>"
        ].join(" ")
    });

})();
(function () {

    "use strict";

    ngX.Component({
        selector: "message-list",
        component: function MessageListComponent($scope, dispatcher, chatStore) {
            var self = this;
            self.dispatcher = dispatcher;
            self.chatStore = chatStore;
            self.messages = self.chatStore.items;

            self.listenerId = self.dispatcher.addListener({
                actionType: "CHANGE",
                callback: function () {
                    self.messages = self.chatStore.items;
                    $scope.$digest();
                }
            });

            self.dispose = function () { self.dispatcher.removeListener({ id: self.listenerId }); }

            return self;
        },
        styles: [
            " .messageList { ",
            " } ",

            " .messageListItem { ",
            " } "

        ].join(" /n "),
        providers: ["$scope", "dispatcher", "chatStore"],
        template: [
            "<div class='messageList'>",
            "<div class='messageListItem' data-ng-repeat='messageItem in vm.messages'>",
            "{{ ::messageItem.username }} : {{ ::messageItem.message }}",
            "</div>",
            "</div>"
        ].join(" ")
    });

})();
(function () {

    "use strict";

    function RegisterComponent($location, dispatcher, userActions) {
        var self = this;
        self.$location = $location;
        self.dispatcher = dispatcher;
        self.userActions = userActions;
        self.username = null;

        self.register = function () {
            self.actionId = self.userActions.register({
                data: {
                    username: self.username
                }
            });
        }

        self.listenerId = self.dispatcher.addListener({
            actionType: "CHANGE",
            callback: function (options) {
                if (options.id === self.actionId) {
                    $location.path("/chat");
                }
            }
        });

        self.deactivate = function () {
            self.dispatcher.removeListener({ id: self.listenerId });
        }

        return self;
    }

    ngX.Component({
        component: RegisterComponent,
        route: "/",
        providers: ["$location", "dispatcher", "userActions"],
        template: [
            "<div class='registerComponent'>",
            "   <input type='text' placeholder='Enter Username' data-ng-model='vm.username'></input>",
            "   <button data-ng-click='vm.register()'>Submit</button> ",
            "</div>"
        ].join(" ")
    });

})();
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
(function () {

    "use strict";

    function eventEmitter(guid) {

        var self = this;

        self.listeners = [];

        self.addListener = function (options) {
            var id = guid();
            self.listeners.push({
                id: id,
                actionType: options.actionType,
                callback: options.callback
            });
            return id;
        };

        self.removeListener = function (options) {
            var length = self.listeners.length
            for (var i = 0; i < length; i++) {
                if (self.listeners[i] &&  self.listeners[i].id === options.id) {
                    self.listeners.splice(i, 1);
                    i = length;
                }
            }
        }

        self.emit = function (options) {
            for (var i = 0; i < self.listeners.length; i++) {
                if (self.listeners[i].actionType === options.actionType) {
                    self.listeners[i].callback(options.options);
                }
            }
        }

        return self;
    }

    angular.module("app").service("dispatcher", ["guid", eventEmitter]);

})();
angular.module("app").value("$", $);
(function () {

    "use strict";

    function store(dispatcher) {

        var self = this;
        self.dispatcher = dispatcher;

        self.createInstance = function () { return new store(self.dispatcher); }

        self.getById = function (id) {
            var item = null;
            for (var i = 0; i < self.items.length; i++) {
                if (self.items[i].id === id) {
                    item = self.items[i];
                }
            }
            return item;
        }

        self.addOrUpdate = function (options) {
            var exists = false;

            if (options.data.id) {
                for (var i = 0; i < self.items.length; i++) {
                    if (self.items[i].id === options.data.id) {
                        exists = true;
                        self.items[i] = options.data;
                    }
                }
            }

            if (!exists)
                self.items.push(options.data);
        }

        self.items = [];

        self.emitChange = function (options) {
            self.dispatcher.emit({
                actionType: "CHANGE", options: {
                    id: options ? options.id : null,
                    data: options ? options.data : null
                }
            });
        }

        return self;
    }

    angular.module("app").service("store", ["dispatcher", store]);
})();
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