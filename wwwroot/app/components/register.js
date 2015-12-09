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