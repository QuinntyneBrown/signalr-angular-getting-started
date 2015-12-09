(function () {

    "use strict";

    function ChatComponent(chatActions, currentUser, dispatcher) {
        var self = this;
        self.chatActions = chatActions;
        self.dispatcher = dispatcher;
        self.currentUser = currentUser;
        self.message = null;
        self.messages = [];

        self.send = function () {
            self.chatActions.send({ username: self.currentUser.username, message: self.message });
            self.message = null;
        }

        self.listenerId = self.dispatcher.addListener({
            actionType: "CHANGE",
            callback: function (options) {
                self.messages.push(options.data);
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
        providers: ["chatActions", "currentUser", "dispatcher"],
        template: [
            "<div class='chatComponent'>",
            "</div>"
        ].join(" ")
    });

})();