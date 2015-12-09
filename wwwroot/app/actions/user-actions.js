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