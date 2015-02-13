define(function(require) {
    'use strict';

    var PieChart = require('drc/pie-chart/PieChart');
    var React = require('react');
    var Search = require('drc/search/Search');
    var Table = require('drc/table/Table');
    var Utils = require('drc/utils/Utils');

    var tableDefinition = {
        url: '/test/table',
        cols: [
            {
                headerLabel: 'NAME',
                dataProperty: 'name',
                hoverProperty: 'username',
                sortDirection: 'ascending',
                dataType: 'string',
                width: '35%'
            },
            {
                headerLabel: 'MESSAGES',
                dataProperty: 'messages',
                sortDirection: 'descending',
                dataType: 'number',
                width: '20%'
            },
            {
                headerLabel: 'LAST MESSAGE',
                dataProperty: 'lastMessage',
                sortDirection: 'descending',
                dataType: 'status',
                timeFormat: 'MMM Do, h:mm A',
                width: '35%'
            }
        ],
        sortColIndex: 0,
        pagination: {
            cursor: 0,
            size: 12
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
        label: 'BROWSERS'
    };

    var searchSubmitCallback = function(event) {
        var companyID = parseInt(event.target.getAttribute('data-id')),
            companyName = event.target.innerText;

        alert('You just clicked on ' + companyName + '. It\'s ID is ' + companyID);
    };

    return React.createClass({
        displayName: 'App',

        getInitialState: function() {
            return {
                selectedComponentSet: window.location.hash.split('#')[1] || 'piechart'
            };
        },

        componentDidUpdate: function() {
            window.location.hash = this.state.selectedComponentSet;
        },

        render: function() {
            var componentSet;

            switch (this.state.selectedComponentSet) {
                case 'piechart':
                    componentSet = (
                        React.createElement("div", {className: "component"}, 
                            React.createElement(PieChart, {definition: pieChartDefinition, 
                            componentId: 'pieChartId', 
                            key: 'pieChartId', 
                            loadingIconClasses: ['icon', 'ion-loading-c']})
                        )
                    );
                    break;
                case 'search':
                    componentSet = (
                        React.createElement(Search, {url: '/test/search', onSelect: searchSubmitCallback, isFullDataResponse: true, minLength: 1})
                    );
                    break;
                case 'table':
                    componentSet = (
                        React.createElement("div", {className: "component"}, 
                            React.createElement(Table, {definition: tableDefinition, 
                                componentId: 'tableId', 
                                key: 'tableId', 
                                loadingIconClasses: ['icon', 'ion-loading-c']})
                        )
                    );
            }
            return (
                React.createElement("div", {className: "app-component"}, 
                    React.createElement("div", {id: "header-component"}, 
                        React.createElement("img", {id: "application-logo", src: "images/dataminr_logo_white-01.png"}), 
                        React.createElement("div", {className: "header-divider"}), 
                        React.createElement("div", {className: "application-description"}, 
                            React.createElement("a", {href: "http://facebook.github.io/react/", target: "_blank", className: "react"}, React.createElement("img", {src: "images/react_logo.png"}), React.createElement("span", null, "React Components")), 
                            React.createElement("a", {href: "https://facebook.github.io/flux/", target: "_blank", className: "flux"}, React.createElement("img", {src: "images/flux_logo.svg"}), React.createElement("span", null, "Flux Architecture"))
                        )
                    ), 
                    React.createElement("div", {className: "sidebar"}, 
                        React.createElement("ul", {className: "nav"}, 
                            React.createElement("li", {className: this.state.selectedComponentSet === 'piechart' ? 'active' : null, 
                                onClick: this.handleLinkClick.bind(this, 'piechart')}, "Pie Chart"), 
                            React.createElement("li", {className: this.state.selectedComponentSet === 'search' ? 'active' : null, 
                                onClick: this.handleLinkClick.bind(this, 'search')}, "Search"), 
                            React.createElement("li", {className: this.state.selectedComponentSet === 'table' ? 'active' : null, 
                                onClick: this.handleLinkClick.bind(this, 'table')}, "Table")
                        )
                    ), 
                    React.createElement("div", {className: "content-component"}, 
                        componentSet
                    )
                )
            );
        },

        handleLinkClick: function(link) {
            this.setState({
                selectedComponentSet: link
            });
        }
    });
});
