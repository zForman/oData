sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Fragment',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast'
], function (jQuery, Fragment, Controller, MessageToast) {
    "use strict";

    return Controller.extend("myapp.controller.Main", {
        onInit: function (oEvent) {

            this.zms_srv = this.getOwnerComponent().getModel('zms_srv');
            this.getView().setModel(new sap.ui.model.json.JSONModel({}));
            this.zms_srv.read("/ProfileSet", {
                success: function (oData) {
                    this.getView().getModel().setProperty('/Profile', oData.results);
                }.bind(this),
                error: function (oError) {
                    console.log('Error', oError);
                }
            });

            this._showFormFragment('Display');
            this.byId('edit').setEnabled(true);

        },

        onExit: function () {
            for (var sPropertyName in this._formFragments) {
                if (!this._formFragments.hasOwnProperty(sPropertyName)) {
                    return;
                }
                this._formFragments[sPropertyName].destroy();
                this._formFragments[sPropertyName] = null;
            }
        },

        handleEditPress: function () {
            //Clone the data
            this._oProfile = jQuery.extend({}, this.getView().getModel().getData().Profile);

            this._toggleButtonsAndView(true);

        },

        handleCancelPress: function () {
            //Restore the data
            var oModel = this.getView().getModel();
            var oData = oModel.getData();

            oData.Profile = this._oProfile;

            oModel.setData(oData);
            this._toggleButtonsAndView(false);
        },


        handleSavePress: function (oEvent) {
            this._toggleButtonsAndView(false);

            var oModel = this.getView().getModel();
            var aData = oModel.getProperty("/Profile/0");

            console.log(aData);

            this.zms_srv.update("/ProfileSet(pernr='00000001')", aData, {
                success: function (aData) {
                    console.log("Answer updated", aData);
                }.bind(this),
                error: function () {
                    console.log("Error");
                }.bind(this)
            });

            // /ProfileSet?$select=cellPhone"

            // this.zms_srv.update("/ProfileSet('00000001')/cellPhone", 'aData', function () {
            //     sap.m.MessageToast.show(" updated Successfully");
            // }, function () {
            //     sap.m.MessageToast.show("failure");
            // });


            // oModel.setProperty("/Profile/0/cellPhone", 'abc')


        },

        _formFragments: {},

        _toggleButtonsAndView: function (bEdit) {
            var oView = this.getView();

            // Show the appropriate action buttons
            oView.byId("edit").setVisible(!bEdit);
            oView.byId("save").setVisible(bEdit);
            oView.byId("cancel").setVisible(bEdit);

            // Set the right form type
            this._showFormFragment(bEdit ? "Change" : "Display");
        },

        _getFormFragment: function (sFragmentName) {
            var oFormFragment = this._formFragments[sFragmentName];

            if (oFormFragment) {
                return oFormFragment;
            }

            oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "myapp." + sFragmentName);

            this._formFragments[sFragmentName] = oFormFragment;
            return this._formFragments[sFragmentName];
        },

        _showFormFragment: function (sFragmentName) {
            var oPage = this.byId("mainView");

            oPage.removeAllContent();
            oPage.insertContent(this._getFormFragment(sFragmentName));
        },


    });

});
