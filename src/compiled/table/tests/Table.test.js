define(function(require) {
    var Utils = require('Utils');
    var Moment = require('moment');
    var React = require('react');
    var Table = require('Table');
    var TableActions = require('TableActions');
    var TableStore = require('TableStore');

    var TestUtils = React.addons.TestUtils;

    var definition = {
        url: 'table/company',
        cols: [
            {
                headerLabel: 'NAME',
                dataProperty: 'name',
                sortDirection: 'ascending',
                dataType: 'string',
                width: '20%'
            },
            {
                headerLabel: 'USERS',
                dataProperty: 'users',
                sortDirection: 'descending',
                dataType: 'number',
                width: '10%'
            },
            {
                headerLabel: 'SESSIONS',
                dataProperty: 'sessions',
                sortDirection: 'descending',
                dataType: 'number',
                width: '10%'
            },
            {
                headerLabel: 'ACTIVE',
                dataProperty: 'activeUsers',
                sortDirection: 'descending',
                dataType: 'percent',
                width: '10%'
            },
            {
                headerLabel: 'PEAK',
                dataProperty: 'peak',
                sortDirection: 'descending',
                dataType: 'time',
                timeFormat: 'MMM Do, h A',
                width: '15%'
            }
        ],
        sortColIndex: 2,
        pagination: {
            cursor: 0,
            size: 10
        },
        rowClick: {
            callback: function() {}
        }
    };

    function spyOnTableGetCalls(data, count, colDef, sortIdx, rowClick, pagination) {
        spyOn(TableStore, 'getData').and.returnValue(data);
        spyOn(TableStore, 'getDataCount').and.returnValue(count);
        spyOn(TableStore, 'getColDefinitions').and.returnValue(colDef);
        spyOn(TableStore, 'getSortColIndex').and.returnValue(sortIdx);
        spyOn(TableStore, 'getRowClickData').and.returnValue(rowClick);
        spyOn(TableStore, 'getPaginationData').and.returnValue(pagination);
    }

    describe('Table', function() {
        var table, id;
        var tableData = [
            {string: 'aaa', integer: -2, mixedCase: 'Aaa', time: 1417455952, percent: 87, status: Moment().subtract(5, 'minutes')},
            {string: 'b', integer: 3, mixedCase: 'B', percent: 42, status: Moment().subtract(14, 'minutes')},
            {string: 'a', integer: 0, mixedCase: 'a', time: 1416591981, percent: 37},
            {string: 'aa', integer: 2, mixedCase: 'Aa', time: 1417715098, percent: 96, status: Moment().subtract(3, 'days')},
            {string: 'aab', integer: -1, mixedCase: 'aAb', percent: 8, status: Moment().subtract(45, 'minutes')},
            {string: 'ab', integer: 1, mixedCase: 'aB', percent: 15, status: Moment().subtract(20, 'hours')},
            {string: 'aba', integer: 1, mixedCase: 'aBA', time: 1406479597, percent: 67, status: Moment().subtract(50, 'days')}
        ];
        var dataCount = tableData.length;
        var colDefinitions = [
            {
                dataProperty: 'string',
                dataType: 'string',
                hoverProperty: 'string',
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
            },
            {
                dataProperty: 'percent',
                dataType: 'percent',
                sortDirection: 'descending'
            },
            {
                dataProperty: 'status',
                dataType: 'status',
                sortDirection: 'off'
            }
        ];
        var sortColIndex = 0;
        var paginationData = {
            cursor: 0,
            size: 2
        };
        var rowClick = {
            callback: function() {}
        };

        function getLoaderClasses(loading) {
            return React.addons.classSet({
                'loader': true,
                'hide' : !loading,
                'icon': loading,
                'ion-loading-c': loading
            });
        }

        beforeEach(function() {
            id = 'table-' + Utils.guid();
            var props = {
                definition: definition,
                getLoaderClasses: getLoaderClasses,
                componentId: id,
                key: id,
                filters: {}
            };

            table = TestUtils.renderIntoDocument(React.createElement(Table.View, React.__spread({},  props)));
        });

        describe('getInitialState function', function() {
            it('should initialize the state of the component', function() {
                expect(table.state.loading).toEqual(true);
                expect(table.state.data).toBeNull();
                expect(table.state.dataError).toEqual(false);
            });
        });

        describe('componentDidMount function', function() {
            it('should register listeners', function() {
                spyOn(TableStore, 'on');
                table.componentDidMount();
                expect(TableStore.on.calls.count()).toEqual(2);
            });

            describe('once listeners are registered', function() {
                beforeEach(function(done) {
                    spyOn(table, 'requestData');
                    table.componentDidMount();
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data for the component', function(done) {
                    expect(table.requestData).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('componentWillUnmount function', function() {
            it('should remove listeners', function() {
                spyOn(TableStore, 'removeListener');
                table.componentWillUnmount();
                expect(TableStore.removeListener.calls.count()).toEqual(2);
            });
        });

        describe('requestData function', function() {
            it('should put the component into a loading state with no data errors', function() {
                table.setState({
                    loading: false,
                    dataError: true
                });

                expect(table.state.loading).toEqual(false);
                expect(table.state.dataError).toEqual(true);

                table.requestData();

                expect(table.state.loading).toEqual(true);
                expect(table.state.dataError).toEqual(false);
            });
        });

        describe('onDataReceived function', function() {
            it('should request the table state and set state for the table to render', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, paginationData);
                table.onDataReceived();

                expect(table.state.data).toEqual(tableData);
            });



            it('should error when the data returns as undefined', function() {
                spyOnTableGetCalls(undefined, dataCount, colDefinitions, undefined, undefined, undefined);
                table.onDataReceived();

                expect(table.state.data).toBeNull();
            });

            it('should show no results if the data returns with an empty array', function() {
                spyOnTableGetCalls([], dataCount, colDefinitions, undefined, undefined, undefined);
                table.onDataReceived();

                expect(table.state.data).toEqual([]);
            });
        });

        describe('onError function', function() {
            it('should set the state to an error state', function() {
                expect(table.state.dataError).toEqual(false);
                table.onError();

                expect(table.state.loading).toEqual(false);
                expect(table.state.dataError).toEqual(true);
            });
        });

        describe('getPaginationControls function', function() {
            it('should not generate controls if there is no data', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({data: null});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control')}).toThrow();
            });

            it('should not generate controls if the data is an empty array', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({data: []});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control')}).toThrow();
            });

            it('should not generate controls if pagination is not defined for the table', function() {
                var dataCount = 0;
                var pagination = {
                    cursor: 1,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();
                table.setState({pagination: null});

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control')}).toThrow();
            });

            it('should enable the right and left clicks if not at the beginning or end of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 50,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control disabled')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control disabled')}).toThrow();
            });

            it('should disable the left click if at the beginning of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 0,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control disabled')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control disabled')}).toThrow();
            });

            it('should disable the right click if at the end of pagination', function() {
                var dataCount = 100;
                var pagination = {
                    cursor: 99,
                    size: 2
                };
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, pagination);
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-left left-control disabled')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'icon ion-chevron-right right-control disabled')}).not.toThrow();
            });
        });

        describe('getColSortDirections function', function() {
            it('should create an array of col sort directions containing "ascending", "descending", and "off"', function() {
                var expectedDirections = ['ascending', 'descending', 'ascending', 'ascending', 'descending', 'off'];
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(table.state.colSortDirections).toEqual(expectedDirections);
            });
        });

        describe('getTableHeaderItem function', function() {
            it('should create table header elements', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'th').length).toEqual(6);
            });
        });

        describe('getTableRowItem function', function() {
            var rowData = {string: 'a', integer: 1};
            var index = 0;

            it('should create table row elements', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'tr').length).toEqual(7);
            });

            it('should have a hover-enabled class if row clicks are defined', function() {
                table.state.rowClick = true;
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.className).toEqual('hover-enabled text-select');
            });

            it('should not have a hover-enabled class if row clicks are not defined', function() {
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.className).toEqual('text-select');
            });

            it('should have an onClick function if row clicks are defined', function() {
                table.state.rowClick = true;
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.onClick).toBeDefined();
            });

            it('should not have an onClick function if row clicks are not defined', function() {
                var tableRowComponent = table.getTableRowItem(rowData, index);

                expect(tableRowComponent.props.onClick).not.toBeDefined();
            });

            it('should make calls to create table data elements', function() {
                table.state.colDefinitions = [
                    {
                        dataProperty: 'string',
                        dataType: 'string',
                        sortDirection: 'ascending'
                    },
                    {
                        dataProperty: 'integer',
                        sortDirection: 'descending'
                    }
                ];
                spyOn(table, 'getTableData');
                table.getTableRowItem(rowData, index);

                expect(table.getTableData.calls.count()).toEqual(2);
            });
        });

        describe('getTableData function', function() {
            it('should create table data elements', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithTag(table, 'td').length).toEqual(42);
            });

            it('should display percentages and add a percent symbol to the end of them', function() {
                var val = 87;
                var meta = {dataType: 'percent'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[0].props.children).toEqual('87%');
                expect(tableDataComponent.props.children[0].props.title).toEqual('87%');
                expect(tableDataComponent.props.children[1]).toBeUndefined();
            });

            it('should display formatted times', function() {
                var val = 1417546800000;
                var meta = {dataType: 'time', timeFormat: 'MMM Do'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[0].props.children).toEqual('Dec 2nd');
                expect(tableDataComponent.props.children[0].props.title).toEqual('Dec 2nd');
                expect(tableDataComponent.props.children[1]).toBeUndefined();
            });

            it('should display "--" for times that are undefined', function() {
                var val;
                var meta = {dataType: 'time', timeFormat: 'MMM Do, h A'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[0].props.title).toEqual('--');
                expect(tableDataComponent.props.children[1]).toBeUndefined();
            });

            it('should display a formatted timestamp if there is a value defined', function() {
                var val = 1417546800000;
                var meta = {dataType: 'status', timeFormat: 'MMM Do'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[0].props.children).toEqual('Dec 2nd');
                expect(tableDataComponent.props.children[0].props.title).toEqual('Dec 2nd');
                expect(tableDataComponent.props.children[1]).toBeDefined();
            });

            it('should display "--" if the status is undefined', function() {
                var val;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[0].props.children).toEqual('--');
                expect(tableDataComponent.props.children[0].props.title).toEqual('--');
                expect(tableDataComponent.props.children[1]).toBeDefined();
            });

            it('should render fa-circle icons after the status of an online user', function() {
                var val = Date.now() - 899999;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon');
                expect(tableDataComponent.props.children[1].props.children.props.className).toEqual('fa fa-circle');
            });

            it('should render fa-circle-o icons after the status of an offline user', function() {
                var val = Date.now() - 900001;
                var meta = {dataType: 'status', timeFormat: 'MMM Do, h A'};
                var tableDataComponent = table.getTableData(val, meta);

                expect(tableDataComponent.props.children[1].props.className).toEqual('after-icon');
                expect(tableDataComponent.props.children[1].props.children.props.className).toEqual('fa fa-circle-o');
            });

            it('should set different title attribute when hover value is passed in', function(){
                var tableDataComponent = table.getTableData('abc', {}, 'def');

                expect(tableDataComponent.props.children[0].props.children).toEqual('abc');
                expect(tableDataComponent.props.children[0].props.title).toEqual('def');
            });
        });

        describe('getIcon function', function() {
            beforeEach(function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
            });

            it('should display the fa-sort-asc icon and be active', function() {
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'fa-sort-asc active')}).not.toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'fa-sort-desc active')}).toThrow();
            });

            it('should display the fa-sort-desc icon and be active', function() {
                colDefinitions[0].sortDirection = 'descending';
                table.onDataReceived();

                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'fa-sort-asc active')}).toThrow();
                expect(function(){TestUtils.findRenderedDOMComponentWithClass(table, 'fa-sort-desc active')}).not.toThrow();

                // reset data
                colDefinitions[0].sortDirection = 'ascending';
            });

            it('should display the fa-sort-desc icon for all columns defaulting to a ascending sort', function() {
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithClass(table, 'fa-sort-asc').length).toEqual(3);

            });

            it('should display the fa-sort-desc icon for all columns defaulting to a descending sort', function() {
                table.onDataReceived();

                expect(TestUtils.scryRenderedDOMComponentsWithClass(table, 'fa-sort-desc').length).toEqual(2);
            });
        });

        describe('handlePageLeftClick function', function() {
            it('should trigger pagination to the left', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, paginationData);

                spyOn(TableActions, 'paginate');
                table.handlePageLeftClick();

                expect(TableActions.paginate).toHaveBeenCalledWith(id, 'left');
            });
        });

        describe('handlePageRightClick function', function() {
            it('should trigger pagination to the right', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, paginationData);

                spyOn(TableActions, 'paginate');
                table.handlePageRightClick();

                expect(TableActions.paginate).toHaveBeenCalledWith(id, 'right');
            });
        });

        describe('handleSortClick function', function() {
            it('should trigger the handle sort click function when attempting to perform an ascending sort', function() {
                var index = 0;
                colDefinitions[0].sortDirection = 'descending';

                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'ascending');

                // reset data
                colDefinitions[0].sortDirection = 'ascending';
            });

            it('should trigger the handle sort click function when attempting to perform a descending sort', function() {
                var index = 0;

                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'descending');
            });

            it('should trigger the handle sort click function when attempting to sort an inactive sortable column', function() {
                var index = 1;

                spyOnTableGetCalls(tableData, dataCount, colDefinitions, sortColIndex, undefined, undefined);
                table.onDataReceived();

                spyOn(TableActions, 'sortChange');

                table.handleSortClick(index);

                expect(TableActions.sortChange).toHaveBeenCalledWith(id, index, 'descending');
            });
        });

        describe('handleRowClick function', function() {
            it('should open a new tab if the row click action was to open a tab.', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, rowClick, undefined);
                var e = {
                    currentTarget: {
                        rowIndex: 0
                    }
                };
                table.onDataReceived();

                spyOn(rowClick, 'callback');
                table.handleRowClick(e);

                expect(rowClick.callback).toHaveBeenCalled();
            });

            it('should not throw an error or execute the callback if a rowClick was not defined.', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, undefined, undefined);
                var e = {
                    currentTarget: {
                        rowIndex: 0
                    }
                };
                table.onDataReceived();

                spyOn(rowClick, 'callback');
                table.handleRowClick(e);

                expect(function() {table.handleRowClick();}).not.toThrow();
                expect(rowClick.callback).not.toHaveBeenCalled();
            });

            it('should throw an error if the callback is not a function.', function() {
                spyOnTableGetCalls(tableData, dataCount, colDefinitions, undefined, 'error', undefined);
                var e = {
                    currentTarget: {
                        rowIndex: 0
                    }
                };
                table.onDataReceived();

                spyOn(rowClick, 'callback');

                expect(function() {table.handleRowClick();}).toThrow();
                expect(rowClick.callback).not.toHaveBeenCalled();
            });
        });
    });
});
