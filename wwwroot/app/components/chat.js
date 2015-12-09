(function () {

    "use strict";

    function ChatComponent($scope,chatActions, chatStore, currentUser, dispatcher) {
        var self = this;
        self.chatActions = chatActions;
        self.chatStore = chatStore;
        self.dispatcher = dispatcher;
        self.currentUser = currentUser;
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
        route: "/register",
        providers: ["$scope","chatActions", "chatStore", "currentUser", "dispatcher"],
        template: [
            "<div class='chatComponent'>",
            "</div>"
        ].join(" ")
    });

})();