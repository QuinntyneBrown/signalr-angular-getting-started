(function () {

    "use strict";

    function RegisterComponent() {
        var self = this;

        return self;
    }

    ngX.Component({
        component: RegisterComponent,
        route: "/register",
        providers: [],
        template: [
            "<div class='registerComponent'>",
            "</div>"
        ].join(" ")
    });

})();