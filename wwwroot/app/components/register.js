(function () {

    "use strict";

    function RegisterComponent($location,dispatcher, userStore) {
        var self = this;
        self.$location = $location;
        self.dispatcher = dispatcher;
        self.userStore = userStore;

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
            actionType: "",
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
        providers: ["$location","dispatcher","userStore"],
        template: [
            "<div class='registerComponent'>",
            "</div>"
        ].join(" ")
    });

})();