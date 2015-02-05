define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');
    var _ = require('lodash');
    var RequestHandler = require('RequestHandler');
    var StoreBase = require('drc/lib/StoreBase');

    var SearchStore = _.merge({
        itemData: [],
        componentType: 'Search',

        /**
         * Returns a list of items for autocomplete search.
         * @return {array} - Store data or empty array if not yet retrieved.
         */
        getData: function() {
            return this.itemData;
        },

        /**
         * Handles all events for search component. For now, this only supports a request data
         * action which requests the list of items to populate for autocomplete.
         * @param  {object} payload - Contains action details.
         */
        dispatchRegister: function(payload){
            var action = payload.action;

            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            RequestHandler.request(action.data.url, null, _.bind(function(data) {
                this.itemData = data;
                this.emitChange();
            }, this), _.bind(function(){
                this.emitFail();
            }, this));
        }
    }, StoreBase);

    AppDispatcher.register(_.bind(SearchStore.dispatchRegister, SearchStore));

    return SearchStore;
});
