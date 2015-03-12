define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');

    return {
        actionTypes: {
            REQUEST_DATA: 'REQUEST_DATA',
            DESTROY_INSTANCE: 'DESTROY_INSTANCE'
        },

        /**
         * Action for populating pie chart data. Used both for initial and subsequent loads.
         * @param {string} id - The id of the component.
         * @param {object} definition - A configuration object for the PieChart.
         * @param {object} filters
         */
        requestData: function(id, definition, filters){
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.REQUEST_DATA,
                component: 'PieChart',
                id: id,
                data: {
                    definition: definition,
                    filters: filters
                }
            });
        },

        destroyInstance: function(id) {
            AppDispatcher.handleViewAction({
                actionType: this.actionTypes.DESTROY_INSTANCE,
                component: 'PieChart',
                id: id
            });
        }
    };
});
