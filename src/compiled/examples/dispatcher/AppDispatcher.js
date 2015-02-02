define(function(require) {
    'use strict';

    var Dispatcher = require('third-party/dispatcher');
    var _ = require('lodash');

    var PayloadSources = {
        SERVER_ACTION: 'SERVER_ACTION',
        VIEW_ACTION: 'VIEW_ACTION'
    };

    var AppDispatcher = _.extend(new Dispatcher(), {
        /**
         * @param {object} action The details of the action, including the action's
         * type and additional data coming from the server.
         */
        handleServerAction: function(action) {
            var payload = {
                source: PayloadSources.SERVER_ACTION,
                action: action
            };
            this.dispatch(payload);
        },

        /**
         * @param {object} action The details of the action, including the action's
         * type and additional data coming from the view.
         */
        handleViewAction: function(action) {
            var payload = {
                source: PayloadSources.VIEW_ACTION,
                action: action
            };
            this.dispatch(payload);
        }
    });

    return AppDispatcher;
});
