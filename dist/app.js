(function () {

    "use strict";

    angular.module("app", ["ngX"]).config(["$routeProvider", function ($routeProvider) {

        $routeProvider.when("/chat", {
            "componentName": "chatComponent"
        });

        $routeProvider.when("/", {
            "componentName": "registerComponent"
        });

    }]);



})();
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
            var self = this;

            return self;
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

    function ChatComponent($location, $scope,chatActions, chatStore, userStore, dispatcher) {
        var self = this;
        self.chatActions = chatActions;
        self.chatStore = chatStore;
        self.dispatcher = dispatcher;
        self.currentUser = userStore.currentUser;

        if (!self.currentUser)
            $location.path("/");

        self.message = null;
       
        Object.defineProperty(self, "messages", {
            "get": function () { return self.chatStore.items }
        });

        self.send = function () {
            self.chatActions.send({ username: self.currentUser.username, message: self.message });
            self.message = null;
        }

        self.listenerId = self.dispatcher.addListener({
            actionType: "CHANGE",
            callback: function (options) {
                $scope.$digest();
            }
        });

        self.deactivate = function () {
            self.dispatcher.removeListener({ id: self.listenerId });
        }

        return self;
    }

    ngX.Component({
        component: ChatComponent,
        route: "/chat",
        providers: ["$location", "$scope", "chatActions", "chatStore", "userStore", "dispatcher"],
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
        component: function MessageListComponent(dispatcher, chatStore) {
            var self = this;
            self.dispatcher = dispatcher;
            self.chatStore = chatStore;
            self.messages = self.chatStore.items;
            self.onInit = function () {

            }

            self.listenerId = self.dispatcher.addListener({
                actionType: "CHANGE",
                callback: function () {
                    self.messages = self.chatStore.items;
                }
            });

            self.dispose = function () {
                self.dispatcher.removeListener({ id: self.listenerId });
            }

            return self;
        },
        styles: [
            " .messageList { ",
            " } ",

            " .messageListItem { ",
            " } "

        ].join(" /n "),
        providers: ["dispatcher","chatStore"],
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

    function RegisterComponent($location, dispatcher, userActions, userStore) {
        var self = this;
        self.$location = $location;
        self.dispatcher = dispatcher;
        self.userActions = userActions;
        self.userStore = userStore;
        self.username = null;

        if (self.userStore.currentUser && self.userStore.currentUser.username)
            self.$location.path("/chat");

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
        providers: ["$location", "dispatcher", "userActions", "userStore"],
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
(function () {

    "use strict";

    function fetch($http, $q, localStorageManager) {

        var self = this;
        self.$http = $http;
        self.$q = $q;
        self.localStorageManager = localStorageManager;

        self.inMemoryCache = {};

        self.fromCacheOrService = function (options) {
            var deferred = self.$q.defer();
            var cachedData = self.localStorageManager.get(self.getCacheKey(options));
            if (!cachedData) {
                self.fromService(options).then( function (results) {
                    deferred.resolve(results);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            } else {
                deferred.resolve(cachedData.value);
            }
            return deferred.promise;
        }

        self.fromInMemoryCacheOrService = function (options) {
            var deferred = self.$q.defer();

            var cachedData = self.inMemoryCache[self.getCacheKey(options)];

            if (!cachedData) {
                self.$http({ method: options.method, url: options.url, data: options.data, params: options.params }).then( function (results) {
                    self.inMemoryCache[self.getCacheKey(options)] = results;
                    deferred.resolve(results);
                }).catch( function (error) {
                    deferred.reject(error);
                });
            } else {
                deferred.resolve(cachedData);
            }
            return deferred.promise;
        }

        self.fromService = function (options) {
            var deferred = self.$q.defer();

            self.$http({ method: options.method, url: options.url, data: options.data, params: options.params }).then( function (results) {
                deferred.resolve(results);
            }).catch(function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        }

        self.getCacheKey = function (options) {
            return options.key || options.url + JSON.stringify(options.params) + JSON.stringify(options.data);
        }

        self.invalidateCache = function (cacheKey) {
            //TODO= Implement
        }

        return self;
    }

    angular.module("app").service("fetch", ["$http","$q","localStorageManager",fetch]);

})();
(function () {


    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    angular.module("app").value("guid", guid);

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
            for (var i = 0; i < self.items.length; i++) {
                if (self.items[i].id === options.data.id) {
                    exists = true;
                    self.items[i] = options.data;
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

    function chatStore(dispatcher, CHAT_ACTIONS, chatHub, store) {
        var self = this;
        self._storeInstance = null;
        self.dispatcher = dispatcher;
        self.store = store;
        self.chatHub = chatHub.getInstance();

        self.chatHub.on("broadcastMessage", function (options) {
            self.items.push(options);
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

        self.items = [];

        return self;
    }


    angular.module("app").service("chatStore",["dispatcher", "CHAT_ACTIONS", "chatHub","store", chatStore])
    .run(["chatStore", function (chatStore) { }]);
})();
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