define(function(require) {
    var Moment = require('moment');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var ActionTypes = TableActions.actionTypes;

    describe('TableStore', function() {
        var id;
        var definition = {};

        beforeEach(function() {
            id = 'table-' + Utils.guid();

            definition.url = '/test/url';
            definition.sortColIndex = 0;
            definition.cols = [
                {
                    dataProperty: 'string',
                    dataType: 'string',
                    sortDirection: 'ascending',
                    quickFilter: true
                },
                {
                    dataProperty: 'integer',
                    dataType: 'number',
                    sortDirection: 'descending',
                    quickFilter: true
                },
                {
                    dataProperty: 'mixedCase',
                    dataType: 'string',
                    sortDirection: 'ascending'
                },
                {
                    dataProperty: 'time',
                    dataType: 'time',
                    timeFormat: 'MMM Do, h A',
                    sortDirection: 'ascending',
                    quickFilter: true
                },
                {
                    dataProperty: 'percent',
                    dataType: 'percent',
                    sortDirection: 'descending',
                    quickFilter: true
                },
                {
                    dataProperty: 'status',
                    dataType: 'status',
                    timeFormat: 'MMM Do, h A',
                    sortDirection: 'descending',
                    quickFilter: true
                }
            ];
            definition.data = [
                {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952, percent: 14, status: 1417455952},
                {string: 'b', integer: 3, mixedCase: 'B', percent: 14},
                {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981, percent: 43, status: 1416591981},
                {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098, percent: 78, status: 1417715098},
                {string: 'aab', integer: -1, mixedCase: 'aAb', percent: 13},
                {string: 'ab', integer: 1, mixedCase: 'aB', percent: 76},
                {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597, percent: 99, status: 1406479597}
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
                var origDefinition = _.clone(definition);
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
                    table.dataFormatter = function(data) {};
                    spyOn(table, 'dataFormatter');

                    table.onDataReceived(data);
                    expect(table.dataFormatter).toHaveBeenCalled();
                    delete table.dataFormatter;
                });

                describe('percent formatter', function() {
                    it('should correctly format a percent dataType', function() {
                        table.onDataReceived(definition.data);

                        expect(table.data[0].percent).toEqual('43%');
                    });
                });

                describe('time formatter', function() {
                    it('should format the time and keep track of the original timestamp', function() {
                        table.onDataReceived(definition.data);

                        expect(table.data[0].time).toBeNonEmptyString();
                        expect(table.data[0].timestamp).toEqual(1416591981);
                    });
                });

                describe('status formatter', function() {
                    it('should set a default onlineLimit if the column is a status column and the onlineLimit was not set', function() {
                        table.onDataReceived(definition.data);

                        expect(table.cols[5].onlineLimit).toEqual(15);
                    });

                    it('should set a default onlineLimit if the column is a status column and the onlineLimit is not a number', function() {
                        definition.cols[5].onlineLimit = '5';
                        table.onDataReceived(definition.data);

                        expect(table.cols[5].onlineLimit).toEqual(15);
                    });

                    it('should set a default onlineLimit if the column is a status column and the onlineLimit is not greater than 1', function() {
                        definition.cols[5].onlineLimit = 0.5;
                        table.onDataReceived(definition.data);

                        expect(table.cols[5].onlineLimit).toEqual(15);
                    });

                    it('should use the set onlineLimit if the column is a status column and the onlineLimit was set correctly', function() {
                        definition.cols[5].onlineLimit = 5;
                        table.onDataReceived(definition.data);

                        expect(table.cols[5].onlineLimit).toEqual(5);
                    });

                    it('should correctly format the time and keep track of the original timestamp', function() {
                        table.onDataReceived(definition.data);

                        expect(table.data[0].status).toBeNonEmptyString();
                        expect(table.data[0].timestamp).toEqual(1416591981);
                    });

                    it('should set the online attribute of a data element to true if the time is within the onlineLimit', function() {
                        definition.cols[5].onlineLimit = 15;
                        definition.data[0].status = Moment().subtract(1, 'minutes').valueOf();
                        spyOn(table, 'sortData');
                        table.onDataReceived(definition.data);

                        expect(table.data[0].online).toBeTruthy();
                    });

                    it('should set the online attribute of a data element to true if the time is not within the onlineLimit', function() {
                        definition.cols[5].onlineLimit = 15;
                        definition.data[0].status = Moment().subtract(16, 'minutes').valueOf();
                        spyOn(table, 'sortData');
                        table.onDataReceived(definition.data);

                        expect(table.data[0].online).toBeFalsy();
                    });
                });

                it('should not error if there is not a sortColIndex defined', function() {
                    table.sortColIndex = null;
                    expect(function(){table.onDataReceived(data);}).not.toThrow();
                });

                // Reset definition
                definition = _.clone(origDefinition);
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

                it('should attempt to filter the data', function() {
                    var filterVal = 'testFilter';
                    spyOn(table, 'filterData').and.callThrough();
                    table.filterValue = filterVal;
                    table.onDataReceived(data);

                    table.getData();

                    expect(table.filterData).toHaveBeenCalled();
                });

                it('should not error if there is not a pagination object defined', function() {
                    table.pagination = null;
                    table.data = [];
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

            describe('filterData function', function() {
                var origDefinition = _.clone(definition);

                beforeEach(function() {
                    definition.cols[0].quickFilter = true;
                    definition.cols[1].quickFilter = true;

                    table.onDataReceived(definition.data);
                    expect(table.data.length).toEqual(7);
                });

                it('should filter data for each column that has quickFilter set to true and set the dataCount', function() {
                    table.filterValue = 'a';
                    expect(table.filterData(definition.data).length).toEqual(6);
                    expect(table.dataCount).toEqual(6);
                });

                it('should filter data for each column that has quickFilter set to true and set the dataCount', function() {
                    table.filterValue = 4;
                    expect(table.filterData(definition.data).length).toEqual(3);
                    expect(table.dataCount).toEqual(3);
                });

                // Reset definition
                definition = _.clone(origDefinition);
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

                    table.pagination = {
                        cursor: 2,
                        size: 2
                    };

                    data = table.sliceData(data);

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
                            dataType: 'number',
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
                    table.onDataReceived(table.data);
                });

                afterEach(function() {
                    table.data = [];
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
                    expect(table.data[0].timestamp).toBeNull();
                    expect(table.data[1].timestamp).toBeNull();
                    expect(table.data[2].timestamp).toBeNull();
                    expect(table.data[3].timestamp).toEqual(1406479597);
                    expect(table.data[4].timestamp).toEqual(1416591981);
                    expect(table.data[5].timestamp).toEqual(1417455952);
                    expect(table.data[6].timestamp).toEqual(1417715098);
                });

                it('should sort objects on a key with timestamps in descending order if some timestamps are undefined', function() {
                    table.sortData(3, 'descending');
                    expect(table.data[0].timestamp).toEqual(1417715098);
                    expect(table.data[1].timestamp).toEqual(1417455952);
                    expect(table.data[2].timestamp).toEqual(1416591981);
                    expect(table.data[3].timestamp).toEqual(1406479597);
                    expect(table.data[4].timestamp).toBeNull();
                    expect(table.data[5].timestamp).toBeNull();
                    expect(table.data[6].timestamp).toBeNull();
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

        describe('setFilterValue function', function() {
            it('should set the filter value for the table instance', function() {
                var val = 'testFilter';
                TableStore.setFilterValue(id, val);

                expect(TableStore.collection[id].filterValue).toEqual(val);
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
                        id: 'testId',
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

            it('should call the filter function and emit a change when the action is requesting that the table be filtered', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.FILTER,
                        component: 'Table',
                        id: 'testId',
                        data: {
                            value: 'testValue'
                        }
                    }
                };

                spyOn(TableStore, 'setFilterValue');
                spyOn(TableStore, 'emitChange');
                TableStore.dispatchRegister(payload);

                expect(TableStore.setFilterValue).toHaveBeenCalledWith(payload.action.id, payload.action.data.value);
                expect(TableStore.emitChange).toHaveBeenCalledWith(payload.action.id);
            });

            it('should call the paginate function and emit a change when the action is requesting that the table be paginated', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.PAGINATE,
                        component: 'Table',
                        id: 'testId',
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

            it('should call the destroyInstance function when the action is requesting that the table be destroyed', function() {
                var payload = {
                    action: {
                        actionType: ActionTypes.DESTROY_INSTANCE,
                        component: 'Table',
                        id: 'testId'
                    }
                };

                spyOn(TableStore, 'destroyInstance');
                TableStore.dispatchRegister(payload);

                expect(TableStore.destroyInstance).toHaveBeenCalledWith(payload.action.id);
            });
        });
    });
});
