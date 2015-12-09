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

    function ChatComponent() {
        var self = this;

        return self;
    }

    ngX.Component({
        component: ChatComponent,
        route: "/chat",
        providers: [],
        template: [
            "<div class='chatComponent'>",
            "</div>"
        ].join(" ")
    });

})();
(function () {

    "use strict";

    function RegisterComponent() {
        var self = this;

        return self;
    }

    ngX.Component({
        component: RegisterComponent,
        route: "/register",
        providers: [],
        template: [
            "<div class='registerComponent'>",
            "</div>"
        ].join(" ")
    });

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