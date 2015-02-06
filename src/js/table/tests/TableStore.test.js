define(function(require) {
    var _ = require('lodash');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var ActionTypes = TableActions.actionTypes;

    describe('TableStore', function() {
        var id;
        var definition = {};

        beforeEach(function() {
            id = 'table-' + Utils.guid();

            definition.sortColIndex = 0;
            definition.cols = [
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
            definition.data = [
                {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952},
                {string: 'b', integer: 3, mixedCase: 'B'},
                {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981},
                {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098},
                {string: 'aab', integer: -1, mixedCase: 'aAb'},
                {string: 'ab', integer: 1, mixedCase: 'aB'},
                {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597}
            ];
            definition.pagination = {
                cursor: 3,
                size: 2
            };

            TableStore.createInstance(id, definition);
        });

        describe('Table', function() {
            var table;

            beforeEach(function() {
                table = new TableStore.Table(id, definition);
            });

            describe('onDataReceived function', function() {
                var val = 'data';
                var val2 = 'data2';
                var data = [{test: val}, {test2: val2}];

                it('should set the data for the table', function() {
                    spyOn(table, 'sortData');
                    expect(table.data).toBeNull();
                    table.onDataReceived(data);
                    expect(table.data).not.toBeNull();
                });

                it('should call formatter if present', function() {
                    spyOn(table, 'sortData');
                    table.dataFormatter = function(data) {
                        data.push({test3: 'data3'});
                        return data;
                    };

                    table.onDataReceived(data);
                    expect(table.data).toEqual([{test: val}, {test2: val2}, {test3: 'data3'}]);
                    delete table.dataFormatter;
                });

                it('should not error if there is not a sortColIndex defined', function() {
                    table.sortColIndex = null;
                    expect(function(){table.onDataReceived(data);}).not.toThrow();
                });
            });

            describe('errorFunction function', function() {
                it('should set the table data to null', function() {
                    expect(table.data).toBeNull();
                    table.errorFunction();
                    expect(table.data).toBeNull();
                });
            });

            describe('getData function', function() {
                var result;
                var val = 'data';
                var data = [{test: val}];

                it('should return the table data', function() {
                    table.onDataReceived(data);
                    result = table.getData();
                    expect(result[0].test).toEqual(val);
                });

                it('should not error if there is not a pagination object defined', function() {
                    table.pagination = null;
                    expect(function(){table.getData();}).not.toThrow();
                });
            });

            describe('getDataCount function', function() {
                it('should return the data count for the table', function() {
                    var val = 'data';
                    var val2 = 'data2';
                    var data = [{test: val}];

                    spyOn(table, 'sortData');
                    table.onDataReceived(data);
                    expect(table.getDataCount()).toEqual(1);

                    data = [{test: val}, {test2: val2}];

                    table.onDataReceived(data);
                    expect(table.getDataCount()).toEqual(2);
                });
            });

            describe('getColDefinitions function', function() {
                it('should retrieve the column definitions for the table', function() {
                    var testColDef = [{prop: 'val1'}, {prop: 'val2'}];

                    table.cols = testColDef;

                    expect(table.getColDefinitions()).toEqual(testColDef);
                });
            });

            describe('getSortColIndex function', function() {
                it('should retrieve the sort column index for the table', function() {
                    var testSortColIdx = 99;

                    table.sortColIndex = testSortColIdx;

                    expect(table.getSortColIndex()).toEqual(testSortColIdx);
                });
            });

            describe('getRowClickData function', function() {
                it('should retrieve row click data for the table', function() {
                    var rowClick = {
                        actionType: 'test',
                        callback: function() {}
                    };

                    table.rowClick = rowClick;

                    expect(table.getRowClickData()).toEqual(rowClick);
                });
            });

            describe('getPaginationData function', function() {
                it('should retrieve pagination data for the table', function() {
                    var pagination = {
                        cursor: 15,
                        size: 5
                    };

                    table.pagination = pagination;

                    expect(table.getPaginationData()).toEqual(pagination);
                });
            });

            describe('paginate function', function() {
                it('should paginate to the right', function() {
                    var direction = 'right';
                    table.pagination = {
                        cursor: 0,
                        size: 5
                    };
                    table.paginate(direction);

                    expect(table.getPaginationData().cursor).toEqual(5);
                });

                it('should paginate to the left', function() {
                    var direction = 'left';
                    table.pagination = {
                        cursor: 10,
                        size: 5
                    };
                    table.paginate(direction);

                    expect(table.getPaginationData().cursor).toEqual(5);
                });
            });

            describe('resetPagination function', function() {
                it('should set the pagination cursor to 0', function() {
                    table.pagination = {
                        cursor: 10,
                        size: 5
                    };
                    table.resetPagination();

                    expect(table.getPaginationData().cursor).toEqual(0);
                });
            });

            describe('sliceData function', function() {
                it('should', function() {
                    var data = [0, 1, 2, 3, 4, 5];

                    var pagination = {
                        cursor: 2,
                        size: 2
                    };

                    data = table.sliceData(data, pagination);

                    expect(data.length).toEqual(2);
                    expect(data[0]).toEqual(2);
                });
            });

            describe('sortData function', function() {
                beforeEach(function() {
                    table.sortColIndex = 0;
                    table.cols = [
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
                    table.data = [
                        {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952},
                        {string: 'b', integer: 3, mixedCase: 'B'},
                        {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981},
                        {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098},
                        {string: 'aab', integer: -1, mixedCase: 'aAb'},
                        {string: 'ab', integer: 1, mixedCase: 'aB'},
                        {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597}
                    ];
                });

                it('should change the sort direction for the column index', function() {
                    expect(table.cols[0].sortDirection).toEqual('ascending');
                    table.sortData(0, 'descending');
                    expect(table.cols[0].sortDirection).toEqual('descending');
                });

                it('should reset pagination when sorting if pagination exists', function() {
                    table.pagination = {
                        cursor: 2,
                        size: 2
                    };
                    expect(table.getPaginationData().cursor).toEqual(2);
                    table.sortData(0, 'descending');
                    expect(table.getPaginationData().cursor).toEqual(0);
                });

                it('should not reset pagination when sorting if pagination does not exists', function() {
                    delete table.pagination;
                    expect(table.getPaginationData()).toBeUndefined();
                    table.sortData(0, 'descending');
                    expect(table.getPaginationData()).toBeUndefined();
                });

                it('should sort objects on a key of type integer in ascending order', function() {
                    table.sortData(1, 'ascending');
                    expect(table.data[0].integer).toEqual(-2);
                    expect(table.data[1].integer).toEqual(-1);
                    expect(table.data[2].integer).toEqual(0);
                    expect(table.data[3].integer).toEqual(1);
                    expect(table.data[4].integer).toEqual(1);
                    expect(table.data[5].integer).toEqual(2);
                    expect(table.data[6].integer).toEqual(3);
                });

                it('should sort objects on a key of type integer in descending order', function() {
                    table.sortData(1, 'descending');
                    expect(table.data[0].integer).toEqual(3);
                    expect(table.data[1].integer).toEqual(2);
                    expect(table.data[2].integer).toEqual(1);
                    expect(table.data[3].integer).toEqual(1);
                    expect(table.data[4].integer).toEqual(0);
                    expect(table.data[5].integer).toEqual(-1);
                    expect(table.data[6].integer).toEqual(-2);
                });

                it('should sort objects on a key of type strings in ascending order', function() {
                    table.sortData(0, 'ascending');
                    expect(table.data[0].string).toEqual('a');
                    expect(table.data[1].string).toEqual('aa');
                    expect(table.data[2].string).toEqual('aaa');
                    expect(table.data[3].string).toEqual('aab');
                    expect(table.data[4].string).toEqual('ab');
                    expect(table.data[5].string).toEqual('aba');
                    expect(table.data[6].string).toEqual('b');
                });

                it('should sort objects on a key of type strings in descending order', function() {
                    table.sortData(0, 'descending');
                    expect(table.data[0].string).toEqual('b');
                    expect(table.data[1].string).toEqual('aba');
                    expect(table.data[2].string).toEqual('ab');
                    expect(table.data[3].string).toEqual('aab');
                    expect(table.data[4].string).toEqual('aaa');
                    expect(table.data[5].string).toEqual('aa');
                    expect(table.data[6].string).toEqual('a');
                });

                it('should sort objects on a key with mixed case strings in a case insensitive manner and in ascending order', function() {
                    table.sortData(2, 'ascending');
                    expect(table.data[0].mixedCase).toEqual('a');
                    expect(table.data[1].mixedCase).toEqual('Aa');
                    expect(table.data[2].mixedCase).toEqual('Aaa');
                    expect(table.data[3].mixedCase).toEqual('aAb');
                    expect(table.data[4].mixedCase).toEqual('aB');
                    expect(table.data[5].mixedCase).toEqual('aBA');
                    expect(table.data[6].mixedCase).toEqual('B');
                });

                it('should sort objects on a key with mixed case strings in a case insensitive manner and in descending order', function() {
                    table.sortData(2, 'descending');
                    expect(table.data[0].mixedCase).toEqual('B');
                    expect(table.data[1].mixedCase).toEqual('aBA');
                    expect(table.data[2].mixedCase).toEqual('aB');
                    expect(table.data[3].mixedCase).toEqual('aAb');
                    expect(table.data[4].mixedCase).toEqual('Aaa');
                    expect(table.data[5].mixedCase).toEqual('Aa');
                    expect(table.data[6].mixedCase).toEqual('a');
                });

                it('should sort objects on a key with timestamps in ascending order if some timestamps are undefined', function() {
                    table.sortData(3, 'ascending');
                    expect(table.data[0].time).toBeUndefined();
                    expect(table.data[1].time).toBeUndefined();
                    expect(table.data[2].time).toBeUndefined();
                    expect(table.data[3].time).toEqual(1406479597);
                    expect(table.data[4].time).toEqual(1416591981);
                    expect(table.data[5].time).toEqual(1417455952);
                    expect(table.data[6].time).toEqual(1417715098);
                });

                it('should sort objects on a key with timestamps in descending order if some timestamps are undefined', function() {
                    table.sortData(3, 'descending');
                    expect(table.data[0].time).toEqual(1417715098);
                    expect(table.data[1].time).toEqual(1417455952);
                    expect(table.data[2].time).toEqual(1416591981);
                    expect(table.data[3].time).toEqual(1406479597);
                    expect(table.data[4].time).toBeUndefined();
                    expect(table.data[5].time).toBeUndefined();
                    expect(table.data[6].time).toBeUndefined();
                });
            });
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
