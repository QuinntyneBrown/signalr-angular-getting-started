(function () {

    "use strict";

    ngX.Component({
        selector: "message-list",
        component: function MessageListComponent($scope, dispatcher, chatStore) {
            var self = this;
            self.dispatcher = dispatcher;
            self.chatStore = chatStore;
            self.messages = self.chatStore.items;

            self.listenerId = self.dispatcher.addListener({
                actionType: "CHANGE",
                callback: function () {
                    self.messages = self.chatStore.items;
                    $scope.$digest();
                }
            });

            self.dispose = function () { self.dispatcher.removeListener({ id: self.listenerId }); }

            return self;
        },
        styles: [
            " .messageList { ",
            " } ",

            " .messageListItem { ",
            " } "

        ].join(" /n "),
        providers: ["$scope", "dispatcher", "chatStore"],
        template: [
            "<div class='messageList'>",
            "<div class='messageListItem' data-ng-repeat='messageItem in vm.messages'>",
            "{{ ::messageItem.username }} : {{ ::messageItem.message }}",
            "</div>",
            "</div>"
        ].join(" ")
    });

})();