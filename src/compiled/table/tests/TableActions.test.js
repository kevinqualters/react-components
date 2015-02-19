define(function(require) {
    var AppDispatcher = require('AppDispatcher');
    var TableActions = require('drc/table/TableActions');

    var ActionTypes = TableActions.actionTypes;

    describe('TableActions', function() {
        describe('requestData function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var definition = {testModelType: 'testModelType'};
                var dataFormatter = 'formatter';
                var filters = {test: 'filter'};

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.requestData(id, definition, dataFormatter, filters);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.REQUEST_DATA,
                    component: 'Table',
                    id: id,
                    data: {
                        definition: definition,
                        dataFormatter: dataFormatter,
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

        describe('filter function', function() {
            it('should request that an action be dispatched', function() {
                var id = 'testID';
                var value = 'testFilter';

                spyOn(AppDispatcher, 'handleViewAction');

                TableActions.filter(id, value);

                expect(AppDispatcher.handleViewAction).toHaveBeenCalledWith({
                    actionType: ActionTypes.FILTER,
                    component: 'Table',
                    id: id,
                    data: {
                        value: value
                    }
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
