//define(function(require) {
//    var BeaconConstants = require('constants/BeaconConstants');
//    var BeaconUtils = require('utils/BeaconUtils');
//    var TableWarehouse = require('warehouses/TableWarehouse');
//
//    var modelTypes = BeaconConstants.TableTypes;
//
//    describe('TableWarehouse', function() {
//        var table;
//
//        beforeEach(function() {
//            var id = 'table-' + BeaconUtils.guid();
//            var modelType = modelTypes.COMPANIES;
//            table = new TableWarehouse.Table(id, modelType);
//        });
//
//        it('should throw an error when creating an instance of a table with a non-existent type', function() {
//            var id = 'table-' + BeaconUtils.guid();
//            var modelType = 'DNE';
//            expect(function(){table = new TableWarehouse.Table(id, modelType);}).toThrow();
//        });
//
//        it('should not throw an error when creating an instance of a table with an existent type', function() {
//            var id = 'table-' + BeaconUtils.guid();
//            var modelType = modelTypes.TOP_ACTIONS;
//            expect(function(){table = new TableWarehouse.Table(id, modelType);}).not.toThrow();
//        });
//
//        describe('dataFormtter function for user action groups table', function(){
//            var groupTable = new TableWarehouse.Table('asdf', modelTypes.USER_ACTION_GROUPS);
//
//            it('should setup data formatter correctly', function(){
//                expect(groupTable.dataFormatter).toBeFunction();
//            });
//
//            it('should group data into days', function(){
//                var dataFormatter = groupTable.dataFormatter;
//                var result = dataFormatter([
//                    {
//                        actionCount: 5,
//                        flowID: 'abc',
//                        start: 1415260800000,
//                        end: 1415261040000
//                    }
//                ]);
//
//                result = result[0];
//                expect(result.groupDate).toBeDate(); //This will vary depending on time zone, so just check it's a date
//                expect(result.duration).toEqual(240000);
//                expect(result.totalCount).toEqual(5);
//                expect(result.actions).toEqual([{
//                    actionCount: 5,
//                    flowID: 'abc',
//                    start: 1415260800000,
//                    end: 1415261040000
//                }]);
//
//                result = dataFormatter([
//                    {
//                        actionCount: 5,
//                        flowID: 'abc',
//                        start: 1415260800000,
//                        end: 1415261040000
//                    },
//                    {
//                        actionCount: 4,
//                        flowID: 'def',
//                        start: 1415262040000,
//                        end: 1415262140000
//                    }
//                ]);
//                result = result[0];
//                expect(result.groupDate).toBeDate();
//                expect(result.duration).toEqual(340000);
//                expect(result.totalCount).toEqual(9);
//                expect(result.actions).toEqual([{
//                    actionCount: 5,
//                    flowID: 'abc',
//                    start: 1415260800000,
//                    end: 1415261040000
//                },
//                    {
//                        actionCount: 4,
//                        flowID: 'def',
//                        start: 1415262040000,
//                        end: 1415262140000
//                    }]);
//
//                result = dataFormatter([
//                    {
//                        actionCount: 5,
//                        flowID: 'abc',
//                        start: 1415260800000,
//                        end: 1415261040000
//                    },
//                    {
//                        actionCount: 4,
//                        flowID: 'def',
//                        start: 1415353600000,
//                        end: 1415355600000
//                    }
//                ]);
//
//                expect(result[0].groupDate).toBeDate();
//                expect(result[0].duration).toEqual(240000);
//                expect(result[0].totalCount).toEqual(5);
//                expect(result[0].actions).toEqual([{
//                    actionCount: 5,
//                    flowID: 'abc',
//                    start: 1415260800000,
//                    end: 1415261040000
//                }]);
//                expect(result[1].groupDate).toBeDate();
//                expect(result[1].duration).toEqual(2000000);
//                expect(result[1].totalCount).toEqual(4);
//                expect(result[1].actions).toEqual([{
//                    actionCount: 4,
//                    flowID: 'def',
//                    start: 1415353600000,
//                    end: 1415355600000
//                }]);
//
//                result = dataFormatter([
//                    {
//                        actionCount: 5,
//                        flowID: 'abc',
//                        start: 1415260800000,
//                        end: 1415260800000
//                    }
//                ]);
//                result = result[0];
//                expect(result.groupDate).toBeDate();
//                expect(result.duration).toEqual(60000);
//                expect(result.totalCount).toEqual(5);
//                expect(result.actions).toEqual([{
//                    actionCount: 5,
//                    flowID: 'abc',
//                    start: 1415260800000,
//                    end: 1415260800000
//                }]);
//            });
//        });
//
//        describe('onDataReceived function', function() {
//            var val = 'data';
//            var val2 = 'data2';
//            var data = [{test: val}, {test2: val2}];
//
//            it('should set the data for the table', function() {
//                expect(table.data).toBeNull();
//                table.onDataReceived(data);
//                expect(table.data).not.toBeNull();
//            });
//
//            it('should call formatter if present', function(){
//                table.dataFormatter = function(data){
//                    data.push({test3: 'data3'});
//                    return data;
//                };
//
//                table.onDataReceived(data);
//                expect(table.data).toEqual([{test: val}, {test2: val2}, {test3: 'data3'}]);
//                delete table.dataFormatter;
//            });
//
//            it('should not error if there is not a sortColIndex defined', function() {
//                table.sortColIndex = null;
//                expect(function(){table.onDataReceived(data);}).not.toThrow();
//            });
//        });
//
//        describe('errorFunction function', function() {
//            it('should set the table data to null', function() {
//                expect(table.data).toBeNull();
//                table.errorFunction();
//                expect(table.data).toBeNull();
//            });
//        });
//
//        describe('getData function', function() {
//            var result;
//            var val = 'data';
//            var data = [{test: val}];
//
//            it('should return the table data', function() {
//                table.onDataReceived(data);
//                result = table.getData();
//                expect(result[0].test).toEqual(val);
//            });
//
//            it('should not error if there is not a pagination object defined', function() {
//                table.pagination = null;
//                expect(function(){table.getData();}).not.toThrow();
//            });
//        });
//
//        describe('getDataCount function', function() {
//            it('should return the data count for the table', function() {
//                var val = 'data';
//                var val2 = 'data2';
//                var data = [{test: val}];
//
//                table.onDataReceived(data);
//                expect(table.getDataCount()).toEqual(1);
//
//                data = [{test: val}, {test2: val2}];
//
//                table.onDataReceived(data);
//                expect(table.getDataCount()).toEqual(2);
//            });
//        });
//
//        describe('getColDefinitions function', function() {
//            it('should retrieve the column definitions for the table', function() {
//                var testColDef = [{prop: 'val1'}, {prop: 'val2'}];
//
//                table.cols = testColDef;
//
//                expect(table.getColDefinitions()).toEqual(testColDef);
//            });
//        });
//
//        describe('getSortColIndex function', function() {
//            it('should retrieve the sort column index for the table', function() {
//                var testSortColIdx = 99;
//
//                table.sortColIndex = testSortColIdx;
//
//                expect(table.getSortColIndex()).toEqual(testSortColIdx);
//            });
//        });
//
//        describe('getRowClickData function', function() {
//            it('should retrieve row click data for the table', function() {
//                var rowClick = {
//                    actionType: 'test',
//                    callback: function() {}
//                };
//
//                table.rowClick = rowClick;
//
//                expect(table.getRowClickData()).toEqual(rowClick);
//            });
//        });
//
//        describe('getPaginationData function', function() {
//            it('should retrieve pagination data for the table', function() {
//                var pagination = {
//                    cursor: 15,
//                    size: 5
//                };
//
//                table.pagination = pagination;
//
//                expect(table.getPaginationData()).toEqual(pagination);
//            });
//        });
//
//        describe('paginate function', function() {
//            it('should paginate to the right', function() {
//                var direction = 'right';
//                table.pagination = {
//                    cursor: 0,
//                    size: 5
//                };
//                table.paginate(direction);
//
//                expect(table.getPaginationData().cursor).toEqual(5);
//            });
//
//            it('should paginate to the left', function() {
//                var direction = 'left';
//                table.pagination = {
//                    cursor: 10,
//                    size: 5
//                };
//                table.paginate(direction);
//
//                expect(table.getPaginationData().cursor).toEqual(5);
//            });
//        });
//
//        describe('resetPagination function', function() {
//            it('should set the pagination cursor to 0', function() {
//                table.pagination = {
//                    cursor: 10,
//                    size: 5
//                };
//                table.resetPagination();
//
//                expect(table.getPaginationData().cursor).toEqual(0);
//            });
//        });
//
//        describe('sliceData function', function() {
//            it('should', function() {
//                var data = [0, 1, 2, 3, 4, 5];
//
//                var pagination = {
//                    cursor: 2,
//                    size: 2
//                };
//
//                data = table.sliceData(data, pagination);
//
//                expect(data.length).toEqual(2);
//                expect(data[0]).toEqual(2);
//            });
//        });
//
//        describe('sortData function', function() {
//            beforeEach(function() {
//                table.sortColIndex = 0;
//                table.cols = [
//                    {
//                        dataProperty: 'string',
//                        dataType: 'string',
//                        sortDirection: 'ascending'
//                    },
//                    {
//                        dataProperty: 'integer',
//                        sortDirection: 'descending'
//                    },
//                    {
//                        dataProperty: 'mixedCase',
//                        dataType: 'string',
//                        sortDirection: 'ascending'
//                    },
//                    {
//                        dataProperty: 'time',
//                        dataType: 'time',
//                        sortDirection: 'ascending'
//                    }
//                ];
//                table.data = [
//                    {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952},
//                    {string: 'b', integer: 3, mixedCase: 'B'},
//                    {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981},
//                    {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098},
//                    {string: 'aab', integer: -1, mixedCase: 'aAb'},
//                    {string: 'ab', integer: 1, mixedCase: 'aB'},
//                    {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597}
//                ];
//            });
//
//            it('should change the sort direction for the column index', function() {
//                expect(table.cols[0].sortDirection).toEqual('ascending');
//                table.sortData(0, 'descending');
//                expect(table.cols[0].sortDirection).toEqual('descending');
//            });
//
//            it('should reset pagination when sorting if pagination exists', function() {
//                table.pagination = {
//                    cursor: 2,
//                    size: 2
//                };
//                expect(table.getPaginationData().cursor).toEqual(2);
//                table.sortData(0, 'descending');
//                expect(table.getPaginationData().cursor).toEqual(0);
//            });
//
//            it('should not reset pagination when sorting if pagination does not exists', function() {
//                delete table.pagination;
//                expect(table.getPaginationData()).toBeUndefined();
//                table.sortData(0, 'descending');
//                expect(table.getPaginationData()).toBeUndefined();
//            });
//
//            it('should sort objects on a key of type integer in ascending order', function() {
//                table.sortData(1, 'ascending');
//                expect(table.data[0].integer).toEqual(-2);
//                expect(table.data[1].integer).toEqual(-1);
//                expect(table.data[2].integer).toEqual(0);
//                expect(table.data[3].integer).toEqual(1);
//                expect(table.data[4].integer).toEqual(1);
//                expect(table.data[5].integer).toEqual(2);
//                expect(table.data[6].integer).toEqual(3);
//            });
//
//            it('should sort objects on a key of type integer in descending order', function() {
//                table.sortData(1, 'descending');
//                expect(table.data[0].integer).toEqual(3);
//                expect(table.data[1].integer).toEqual(2);
//                expect(table.data[2].integer).toEqual(1);
//                expect(table.data[3].integer).toEqual(1);
//                expect(table.data[4].integer).toEqual(0);
//                expect(table.data[5].integer).toEqual(-1);
//                expect(table.data[6].integer).toEqual(-2);
//            });
//
//            it('should sort objects on a key of type strings in ascending order', function() {
//                table.sortData(0, 'ascending');
//                expect(table.data[0].string).toEqual('a');
//                expect(table.data[1].string).toEqual('aa');
//                expect(table.data[2].string).toEqual('aaa');
//                expect(table.data[3].string).toEqual('aab');
//                expect(table.data[4].string).toEqual('ab');
//                expect(table.data[5].string).toEqual('aba');
//                expect(table.data[6].string).toEqual('b');
//            });
//
//            it('should sort objects on a key of type strings in descending order', function() {
//                table.sortData(0, 'descending');
//                expect(table.data[0].string).toEqual('b');
//                expect(table.data[1].string).toEqual('aba');
//                expect(table.data[2].string).toEqual('ab');
//                expect(table.data[3].string).toEqual('aab');
//                expect(table.data[4].string).toEqual('aaa');
//                expect(table.data[5].string).toEqual('aa');
//                expect(table.data[6].string).toEqual('a');
//            });
//
//            it('should sort objects on a key with mixed case strings in a case insensitive manner and in ascending order', function() {
//                table.sortData(2, 'ascending');
//                expect(table.data[0].mixedCase).toEqual('a');
//                expect(table.data[1].mixedCase).toEqual('Aa');
//                expect(table.data[2].mixedCase).toEqual('Aaa');
//                expect(table.data[3].mixedCase).toEqual('aAb');
//                expect(table.data[4].mixedCase).toEqual('aB');
//                expect(table.data[5].mixedCase).toEqual('aBA');
//                expect(table.data[6].mixedCase).toEqual('B');
//            });
//
//            it('should sort objects on a key with mixed case strings in a case insensitive manner and in descending order', function() {
//                table.sortData(2, 'descending');
//                expect(table.data[0].mixedCase).toEqual('B');
//                expect(table.data[1].mixedCase).toEqual('aBA');
//                expect(table.data[2].mixedCase).toEqual('aB');
//                expect(table.data[3].mixedCase).toEqual('aAb');
//                expect(table.data[4].mixedCase).toEqual('Aaa');
//                expect(table.data[5].mixedCase).toEqual('Aa');
//                expect(table.data[6].mixedCase).toEqual('a');
//            });
//
//            it('should sort objects on a key with timestamps in ascending order if some timestamps are undefined', function() {
//                table.sortData(3, 'ascending');
//                expect(table.data[0].time).toBeUndefined();
//                expect(table.data[1].time).toBeUndefined();
//                expect(table.data[2].time).toBeUndefined();
//                expect(table.data[3].time).toEqual(1406479597);
//                expect(table.data[4].time).toEqual(1416591981);
//                expect(table.data[5].time).toEqual(1417455952);
//                expect(table.data[6].time).toEqual(1417715098);
//            });
//
//            it('should sort objects on a key with timestamps in descending order if some timestamps are undefined', function() {
//                table.sortData(3, 'descending');
//                expect(table.data[0].time).toEqual(1417715098);
//                expect(table.data[1].time).toEqual(1417455952);
//                expect(table.data[2].time).toEqual(1416591981);
//                expect(table.data[3].time).toEqual(1406479597);
//                expect(table.data[4].time).toBeUndefined();
//                expect(table.data[5].time).toBeUndefined();
//                expect(table.data[6].time).toBeUndefined();
//            });
//        });
//    });
//});
