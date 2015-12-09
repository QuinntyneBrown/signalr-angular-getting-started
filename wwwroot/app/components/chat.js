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