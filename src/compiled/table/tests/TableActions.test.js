define(function(require) {
    var AppDispatcher = require('AppDispatcher');
    var TableActions = require('TableActions');

    var ActionTypes = TableActions.actionTypes;

    describe('TableActions', function() {
        describe('requestData function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var definition = {testModelType: 'testModelType'};
                var filters = {test: 'filter'};

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.requestData(id, definition, filters);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.REQUEST_DATA,
                    component: 'Table',
                    id: id,
                    data: {
                        definition: definition,
                        filters: filters
                    }
                });
            });
        });

        describe('destroyInstance function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.destroyInstance(id);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.DESTROY_INSTANCE,
                    component: 'Table',
                    id: id
                });
            });
        });

        describe('paginate function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var direction = 'testDirection';

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.paginate(id, direction);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.PAGINATE,
                    component: 'Table',
                    id: id,
                    data: {
                        direction: direction
                    }
                });
            });
        });

        describe('sortChange function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var colIndex = 0;
                var direction = 'testDirection';

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.sortChange(id, colIndex, direction);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.TABLE_SORT,
                    component: 'Table',
                    id: id,
                    data: {
                        colIndex: colIndex,
                        direction: direction
                    }
                });
            });
        });
    });
});
