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

            // var oSource = oEvent.getSource();
            // var oContext = oSource.getBindingContext();
            // console.log(oSource);

            this.zms_srv.read("/ProfileSet", {
                success: function (oData) {
                    this.getView().getModel().setProperty('/Profile', oData.results);
                }.bind(this),
                error: function (oError) {
                    console.log('Error', oError);
                }
            });

            this.zms_srv.read("/OrgSet", {
                urlParameters: {
                    "$expand": "NavOrgOrg/NavOrgOrg/NavOrgOrg/NavOrgOrg/NavOrgOrg",
                },
                filters: [
                    new sap.ui.model.Filter("type", "EQ", "O"),
                ],
                success: function (oData, oNavOrg) {
                    // console.log("OrgSet", oData);
                    // console.log("oNavOrg", oNavOrg);
                    var arr = [];
                    var aSearch = oNavOrg.data.results;

                    // aSearch.map(function (val) {
                    //     if (val['type'] === 'O') {
                    //         arr.push(val['NavOrgOrg']);
                    //     }
                    // });

                    function iterObj(aSearch) {

                        for (var key in aSearch) {
                            // console.log(key + ': ' + aSearch[key]);
                            if (aSearch[key] !== null && typeof aSearch[key] === "object") {
                                // Recurse into children
                                iterObj(aSearch[key]);
                                if (aSearch[key]['type'] === "O") {
                                    // console.log(key);
                                    arr.push(aSearch[key]);
                                }
                                // console.log(key);
                            }

                        }
                    }

                    iterObj(aSearch);
                    // for (var key in aSearch) {
                    //     if (aSearch['type'] === 'S') ;
                    //     arr.push(aSearch[key])
                    // }
                    // aSearch.forEach(function (val) {
                    //     if (val['NavOrgOrg']) {
                    //         // console.log(val['NavOrgOrg']);
                    //         arr.push(val['NavOrgOrg'].results);
                    //     }
                    // });
                    console.log(arr);
                    // console.log("aSearch: " + aSearch);

                    this.getView().getModel().setProperty('/Org', arr);
                }.bind(this),
                error: function (oError) {
                    console.log('Error', oError);
                }
            });

            // var aOrgUnit = this.getView().getModel().getProperty("/Profile/results");
            // console.log(aOrgUnit);
        },

        onAfterRendering: function () {
            var oSplitCont = this.getSplitContObj(),
                ref = oSplitCont.getDomRef() && oSplitCont.getDomRef().parentNode;
            // set all parent elements to 100% height, this should be done by app developer, but just in case
            if (ref && !ref._sapUI5HeightFixed) {
                ref._sapUI5HeightFixed = true;
                while (ref && ref !== document.documentElement) {
                    var $ref = jQuery(ref);
                    if ($ref.attr("data-sap-ui-root-content")) { // Shell as parent does this already
                        break;
                    }
                    if (!ref.style.height) {
                        ref.style.height = "100%";
                    }
                    ref = ref.parentNode;
                }
            }
        },

        onListItemPress: function (oEvent) {
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            // console.log(sToPageId);
            this.getSplitContObj().toDetail(this.createId(sToPageId));
        },

        onItemSelected: function (oEvent) {

            //Получаем выделенный элемент в списке
            var oSelectedItems = oEvent.getParameter('listItem');
            var oContext = oSelectedItems.getBindingContext();
            var sPath = oContext.getPath('');
            var oPanel = this.byId('employeeListDetail');
            oPanel.bindElement({path: sPath});
            oPanel.setVisible(true);
            // console.log(oSelectedItems)
        },

        handleSavePress: function (oEvent) {
            var that = this;
            var oModel = this.getView().getModel();
            var aData = oModel.getProperty("/Profile");

            aData.forEach(function (item) {
                    var key = that.zms_srv.createKey("/ProfileSet", {
                        pernr: item['pernr']
                    });

                    that.zms_srv.update(key, item, {
                        success: function (oData) {
                            console.log("Answer updated", oData);
                        }.bind(this),
                        error: function () {
                            console.log("Error");
                        }.bind(this)
                    })
                },
            );
            console.log('handleSavePress');

            this.oDialog.close();
        },

        handleEditPress: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath('');
            var oFormChange = sap.ui.getCore().byId("myDialog");
            // oFormChange.bindElement({sPath});
            console.log(oFormChange);
            // console.log('sPath:' + sPath);

            console.log(oFormChange);

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("myapp.view.Change", this);
            }
            console.log('handleEditPress');
            this.oDialog.open();
        },

        cancelSavePress: function () {
            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment("myapp.view.Change", this);
            }
            console.log('cancelSavePress');
            this.oDialog.close();
        },


        getSplitContObj: function () {
            var result = this.byId("SplitCont");
            if (!result) {
                jQuery.sap.log.error("SplitApp object can't be found");
            }
            return result;
        }
    });
});