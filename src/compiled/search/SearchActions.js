define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');

    return {
        actionTypes: {
            REQUEST_DATA: 'REQUEST_DATA'
        },

        /**
         * Action for populating pie chart data. Used both for initial and subsequent loads.
         */
        requestData: function() {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.REQUEST_DATA,
                component: 'Search'
            });
        }
    };
});
