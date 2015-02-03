define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');

    return {
        actionTypes: {
            REQUEST_DATA: 'REQUEST_DATA'
        },

        /**
         * Action for populating pie chart data. Used both for initial and subsequent loads.
         * @param {string} url - the endpoint to retrieve the search items from.
         */
        requestData: function(url) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.REQUEST_DATA,
                component: 'Search',
                data: {
                    url: url
                }
            });
        }
    };
});
