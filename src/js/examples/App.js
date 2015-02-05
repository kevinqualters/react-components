define(function(require) {
    'use strict';

    var PieChart = require('PieChart');
    var React = require('react');
    var Search = require('Search');
    var Table = require('Table');
    var Utils = require('Utils');

    var tableDefinition = {
        url: '/test/table',
        cols: [
            {
                headerLabel: 'NAME',
                dataProperty: 'name',
                sortDirection: 'ascending',
                dataType: 'string',
                width: '100%'
            }
        ],
        sortColIndex: 0,
        pagination: {
            cursor: 0,
            size: 2
        },
        rowClick: {
            callback: function(event, props, state) {
                var idx = event.currentTarget.rowIndex;
                alert(
                    'You just clicked on ' + state.data[idx][state.rowClick.labelKey || 'name'] + '.' +
                    'We just executed the user defined rowClick.callback:\n\n' +
                    'callback: function(event, props, state) {\n' +
                    '    var idx = event.currentTarget.rowIndex;\n' +
                    '    alert(\'You just clicked on +\'\n    state.data[idx][state.rowClick.labelKey \n    || \'name\'] + \'.\');\n' +
                    '}'
                );
            }
        }
    };

    var pieChartDefinition = {
        url: '/test/piechart',
        label: 'Pie Chart'
    };

    var searchSubmitCallback = function(event) {
        var companyID = parseInt(event.target.getAttribute('data-id')),
            companyName = event.target.innerText;

        alert('You just clicked on ' + companyName + '. It\'s ID is ' + companyID);
    };

    var App = React.createClass({
        render: function() {
            return (
                <div className="app-component">
                    <div id="header-component">
                        <img id="application-logo" src="images/dataminr_logo_white-01.png" />
                        <div className="header-divider"></div>
                        <div id="application-description">REACT COMPONENTS</div>
                    </div>
                    <div className="content-component">
                        <Search url={'/test/search'} searchSubmitCallback={searchSubmitCallback} />
                        <div className="component">
                            <Table.View definition={tableDefinition}
                                        getLoaderClasses={Utils.getLoaderClasses}
                                        componentId={'tableId'}
                                        key={'tableId'} />
                        </div>
                        <div className="component">
                            <PieChart definition={pieChartDefinition}
                                      getLoaderClasses={Utils.getLoaderClasses}
                                      componentId={'pieChartId'}
                                      key={'pieChartId'} />
                        </div>

                    </div>
                </div>
            );
        }
    });

    return App;
});
