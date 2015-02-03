define(function(require) {
    'use strict';

    var AppDispatcher = require('AppDispatcher');
    var _ = require('lodash');
    var RequestHandler = require('RequestHandler');
    var StoreBase = require('StoreBase');

    var SearchStore = _.merge({
        companyData: [],
        componentType: 'Search',

        /**
         * Returns a list of companies for autocomplete search.
         * @return {array} - Store data or empty array if not yet retrieved.
         */
        getData: function() {
            return this.companyData;
        },

        /**
         * Handles all events for search component. For now, this only supports a request data
         * action which requests the list of companies to populate for autocomplete.
         * @param  {object} payload - Contains action details.
         */
        dispatchRegister: function(payload){
            var action = payload.action;

            if (!this.shouldHandleAction(action.component)) {
                return;
            }

            RequestHandler.request('/search/getCompanyList', null, _.bind(function(data) {
                this.companyData = data;
                this.emitChange();
            }, this), _.bind(function(){
                this.emitFail();
            }, this));
        }
    }, StoreBase);

    AppDispatcher.register(_.bind(SearchStore.dispatchRegister, SearchStore));

    return SearchStore;
});
