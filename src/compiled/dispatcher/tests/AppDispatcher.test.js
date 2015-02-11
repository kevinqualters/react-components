define(function(require) {
    var AppDispatcher = require('AppDispatcher');
    var PayloadSources = {
        SERVER_ACTION: 'SERVER_ACTION',
        VIEW_ACTION: 'VIEW_ACTION'
    };

    describe('AppDispatcher', function() {
        var testAction;

        beforeEach(function() {
            testAction = {
                data: 'test'
            };

            spyOn(AppDispatcher, 'dispatch');
        });

        it('should properly dispatch a server action', function() {
            AppDispatcher.handleServerAction(testAction);

            expect(AppDispatcher.dispatch).toHaveBeenCalledWith({
                source: PayloadSources.SERVER_ACTION,
                action: testAction
            });
        });

        it('should properly dispatch a view action', function() {
            AppDispatcher.handleViewAction(testAction);

            expect(AppDispatcher.dispatch).toHaveBeenCalledWith({
                source: PayloadSources.VIEW_ACTION,
                action: testAction
            });
        });
    });
});
