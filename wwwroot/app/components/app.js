﻿(function () {

    "use strict";

    ngX.Component({
        selector: "app",
        component: function AppComponent() {
        },
        template: [
            "<div class='app'>",
            "   <div class='mainContent' data-ng-view>",
            "   </div>",
            "</div>"
        ].join(" ")
    });
})();