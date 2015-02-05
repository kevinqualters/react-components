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

    var App = React.createClass({displayName: 'App',
        render: function() {
            return (
                React.createElement("div", {className: "app-component"}, 
                    React.createElement("div", {id: "header-component"}, 
                        React.createElement("img", {id: "application-logo", src: "images/dataminr_logo_white-01.png"}), 
                        React.createElement("div", {className: "header-divider"}), 
                        React.createElement("div", {id: "application-description"}, "REACT COMPONENTS")
                    ), 
                    React.createElement("div", {className: "content-component"}, 
                        React.createElement(Search, {url: '/test/search', searchSubmitCallback: searchSubmitCallback}), 
                        React.createElement("div", {className: "component"}, 
                            React.createElement(Table.View, {definition: tableDefinition, 
                                        getLoaderClasses: Utils.getLoaderClasses, 
                                        componentId: 'tableId', 
                                        key: 'tableId'})
                        ), 
                        React.createElement("div", {className: "component"}, 
                            React.createElement(PieChart, {definition: pieChartDefinition, 
                                      getLoaderClasses: Utils.getLoaderClasses, 
                                      componentId: 'pieChartId', 
                                      key: 'pieChartId'})
                        )

                    )
                )
            );
        }
    });

    return App;
});
