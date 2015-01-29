define(function(require) {
    var _ = require('lodash');
    var TableActions = require('TableActions');
    var TableStore = require('TableStore');
    var Utils = require('Utils');

    var ActionTypes = TableActions.actionTypes;

    describe('TableStore', function() {
        var id;
        var definitionObject = {};

        beforeEach(function() {
            var definition = _.clone(definitionObject);
            id = 'table-' + Utils.guid();

            TableStore.createInstance(id, definition);

            TableStore.collection[id].sortColIndex = 0;
            TableStore.collection[id].cols = [
                {
                    dataProperty: 'string',
                    dataType: 'string',
                    sortDirection: 'ascending'
                },
                {
                    dataProperty: 'integer',
                    sortDirection: 'descending'
                },
                {
                    dataProperty: 'mixedCase',
                    dataType: 'string',
                    sortDirection: 'ascending'
                },
                {
                    dataProperty: 'time',
                    dataType: 'time',
                    sortDirection: 'ascending'
                }
            ];
            TableStore.collection[id].data = [
                {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952},
                {string: 'b', integer: 3, mixedCase: 'B'},
                {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981},
                {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098},
                {string: 'aab', integer: -1, mixedCase: 'aAb'},
                {string: 'ab', integer: 1, mixedCase: 'aB'},
                {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597}
            ];
        });

        describe('createInstance function', function() {
            it('should create an instance of the Table class', function() {
                expect(TableStore.collection[id]).toBeTruthy();
            });
        });

        describe('destroyInstance function', function() {
            it('should destroy an instance of the Table class', function() {
                TableStore.destroyInstance(id);
                expect(TableStore.collection[id]).toBeFalsy();
            });
        });

        describe('getData function', function() {
            it('should trigger the getData function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getData');
                TableStore.getData(id);

                expect(TableStore.collection[id].getData).toHaveBeenCalled();
            });
        });

        describe('getDataCount function', function() {
            it('should trigger the getDataCount function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getDataCount');
                TableStore.getDataCount(id);

                expect(TableStore.collection[id].getDataCount).toHaveBeenCalled();
            });
        });

        describe('getColDefinitions function', function() {
            it('should trigger the getColDefinitions function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getColDefinitions');
                TableStore.getColDefinitions(id);

                expect(TableStore.collection[id].getColDefinitions).toHaveBeenCalled();
            });
        });

        describe('getSortColIndex function', function() {
            it('should trigger the getSortColIndex function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getSortColIndex');
                TableStore.getSortColIndex(id);

                expect(TableStore.collection[id].getSortColIndex).toHaveBeenCalled();
            });
        });

        describe('getRowClickData function', function() {
            it('should trigger the getRowClickData function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getRowClickData');
                TableStore.getRowClickData(id);

                expect(TableStore.collection[id].getRowClickData).toHaveBeenCalled();
            });
        });

        describe('getPaginationData function', function() {
            it('should trigger the getPaginationData function for the table instance', function() {
                spyOn(TableStore.collection[id], 'getPaginationData');
                TableStore.getPaginationData(id);

                expect(TableStore.collection[id].getPaginationData).toHaveBeenCalled();
            });
        });

        describe('paginate function', function() {
            it('should trigger the paginate function for the table instance', function() {
                var direction = 'ascending';

                spyOn(TableStore.collection[id], 'paginate');
                TableStore.paginate(id, direction);

                expect(TableStore.collection[id].paginate).toHaveBeenCalledWith(direction);
            });
        });

        describe('sortData function', function() {
            it('should trigger the sortData function for the table instance', function() {
                var colIndex = 0;
                var direction = 'descending';

                spyOn(TableStore.collection[id], 'sortData');
                TableStore.sortData(id, colIndex, direction);

                expect(TableStore.collection[id].sortData).toHaveBeenCalledWith(colIndex, direction);
            });
        });

        describe('dispatchRegister function', function() {
            it('should not handle the action if the component type is not supported', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.REQUEST_DATA
                    }
                };
                spyOn(TableStore, 'handleRequestDataAction');
                TableStore.dispatchRegister(payload);

                expect(TableStore.handleRequestDataAction).not.toHaveBeenCalled();
            });

            it('should handle the action if the component type is supported, but not emit a change if the action is not defined', function() {
                var payload = {
                    action: {
                        actionType: 'thisActionIsNotSupported',
                        component: 'Table'
                    }
                };
                spyOn(TableStore, 'emitChange');
                TableStore.dispatchRegister(payload);

                expect(TableStore.emitChange).not.toHaveBeenCalled();
            });

            it('should call the handleRequestDataAction function when the action is requesting data', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.REQUEST_DATA,
                        component: 'Table'
                    }
                };

                spyOn(TableStore, 'handleRequestDataAction');
                TableStore.dispatchRegister(payload);

                expect(TableStore.handleRequestDataAction).toHaveBeenCalledWith(payload.action);
            });

            it('should call the sortData function and emit a change when the action is requesting that the table is sorted', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.TABLE_SORT,
                        component: 'Table',
                        data: {
                            colIndex: 0,
                            direction: 'descending'
                        }
                    }
                };

                spyOn(TableStore, 'sortData');
                spyOn(TableStore, 'emitChange');
                TableStore.dispatchRegister(payload);

                expect(TableStore.sortData).toHaveBeenCalledWith(payload.action.id, payload.action.data.colIndex, payload.action.data.direction);
                expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
            });

            it('should call the paginate function and emit a change when the action is requesting that the table be paginated', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.PAGINATE,
                        component: 'Table',
                        data: {
                            direction: 'right'
                        }
                    }
                };

                spyOn(TableStore, 'paginate');
                spyOn(TableStore, 'emitChange');
                TableStore.dispatchRegister(payload);

                expect(TableStore.paginate).toHaveBeenCalledWith(payload.action.id, payload.action.data.direction);
                expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
            });
        });
    });
});
