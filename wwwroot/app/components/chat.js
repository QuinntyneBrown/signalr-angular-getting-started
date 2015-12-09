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