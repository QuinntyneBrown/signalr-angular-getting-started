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

    function ChatComponent(chatHub, dispatcher) {
        var self = this;
        self.chatHubInstance = chatHub.getInstance();
        self.send = function () {
            if(chatHub.started)
                self.chatHubInstance.invoke("send", currentUser.username, self.message);
        }

        return self;
    }

    ngX.Component({
        component: ChatComponent,
        route: "/register",
        providers: ["chatHub", "currentUser", "dispatcher"],
        template: [
            "<div class='chatComponent'>",
            "</div>"
        ].join(" ")
    });

})();
(function () {

    "use strict";

    function RegisterComponent(chatHub, dispatcher) {
        var self = this;

        self.chatHub = chatHub.getInstance();

        if (!chatHub.started) {
            var listenerId = dispatcher.addListener({
                actionType: "CHAT_HUB_STARTED", callback: function () {
                    self.chatHub.invoke("send", "Quinn", "Message");
                    dispatcher.removeListener({ id: listenerId });
                }
            });
        } else {
            self.chatHub.invoke("send", "Quinn", "Message");
        }


        self.send = function () {
            
        }

        return self;
    }

    ngX.Component({
        component: RegisterComponent,
        route: "/register",
        providers: ["chatHub","dispatcher"],
        template: [
            "<div class='registerComponent'>",
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
            alert("Works");
            self.storeInstance.emitChange({ options: options });
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


    angular.module("app").service("chatStore",["dispatcher", "CHAT_ACTIONS", "chatHub","store", chatStore])
    .run(["chatStore", function (chatStore) { }]);
})();