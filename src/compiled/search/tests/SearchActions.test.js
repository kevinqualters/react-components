define(function(require) {
    var AppDispatcher = require('AppDispatcher');
    var SearchActions = require('SearchActions');

    describe('SearchActions', function() {
        describe('requestData function', function() {
            it('should request that an action be dispatched', function() {
                var url = '/test/url';

                spyOn(AppDispatcher, 'handleViewAction');

                SearchActions.requestData(url);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: SearchActions.actionTypes.REQUEST_DATA,
                    component: 'Search',
                    data: {
                        url: url
                    }
                });
            });
        });
    });
});
