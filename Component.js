sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend("myapp.Component", {
        metadata: {
            manifest: "json"
        },


        onInit: function () {
            sap.ui.core.UIComponent.prototype.init.apply( this, arguments);
        }
    });
});