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