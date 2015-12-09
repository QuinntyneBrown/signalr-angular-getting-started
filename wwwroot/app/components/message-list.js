(function () {

    "use strict";

    ngX.Component({
        selector: "message-list",
        component: function MessageListComponent(dispatcher, chatStore) {
            var self = this;
            self.dispatcher = dispatcher;
            self.chatStore = chatStore;
            self.messages = self.chatStore.items;
            self.onInit = function () {

            }

            self.listenerId = self.dispatcher.addListener({
                actionType: "CHANGE",
                callback: function () {
                    self.messages = self.chatStore.items;
                }
            });

            self.dispose = function () {
                self.dispatcher.removeListener({ id: self.listenerId });
            }

            return self;
        },
        styles: [
            " .messageList { ",
            " } ",

            " .messageListItem { ",
            " } "

        ].join(" /n "),
        providers: ["dispatcher","chatStore"],
        template: [
            "<div class='messageList'>",
            "<div class='messageListItem' data-ng-repeat='messageItem in vm.messages'>",
            "{{ ::messageItem.username }} : {{ ::messageItem.message }}",
            "</div>",
            "</div>"
        ].join(" ")
    });

})();