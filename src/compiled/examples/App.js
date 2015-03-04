define(function(require) {
    'use strict';

    var Modal = require('drc/modal/Modal');
    var PieChart = require('drc/pie-chart/PieChart');
    var PortalMixins = require('drc/mixins/PortalMixins');
    var React = require('react');
    var Search = require('drc/search/Search');
    var Table = require('drc/table/Table');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var tableDefinition = {
        url: '/test/table',
        cols: [
            {
                dataType: 'select',
                dataProperty: 'name',
                width: '35px'
            },
            {
                headerLabel: 'NAME',
                dataProperty: 'name',
                sortDirection: 'ascending',
                dataType: 'string',
                width: '20%',
                quickFilter: true
            },
            {
                headerLabel: 'MESSAGES',
                dataProperty: 'messages',
                sortDirection: 'descending',
                dataType: 'number',
                width: '15%',
                quickFilter: true
            },
            {
                headerLabel: 'USAGE',
                dataProperty: 'usage',
                sortDirection: 'descending',
                dataType: 'percent',
                width: '10%',
                quickFilter: true
            },
            {
                headerLabel: 'LAST LOGIN',
                dataProperty: 'lastLogin',
                sortDirection: 'descending',
                dataType: 'time',
                timeFormat: 'MMM Do, h A',
                width: '25%',
                quickFilter: true
            },
            {
                headerLabel: 'LAST MESSAGE',
                dataProperty: 'lastMessage',
                sortDirection: 'descending',
                dataType: 'status',
                onlineLimit: 4,
                timeFormat: 'MMM Do, h:mm A',
                width: '24%',
                quickFilter: true
            }
        ],
        sortColIndex: 1,
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

        mixins: [PortalMixins],

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
                case 'modal':
                    componentSet = (
                        React.createElement("div", {className: "component modal"}, 
                            React.createElement("input", {type: "button", className: "modal-button", onClick: this.openModal, value: "Open Modal"})
                        )
                    );
                    break;
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
                            React.createElement("div", {className: "bulk-action-button", onClick: this.handleBulkActionClick}, "Bulk Action"), 
                            React.createElement(Table, {definition: tableDefinition, 
                                   componentId: "tableId", 
                                   key: "tableId", 
                                   loadingIconClasses: ['icon', 'ion-loading-c'], 
                                   quickFilterPlaceholder: "Quick Filter"})
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
                        React.createElement("ul", {className: "nav no-select"}, 
                            React.createElement("li", {className: this.state.selectedComponentSet === 'modal' ? 'active' : null, 
                                onClick: this.handleLinkClick.bind(this, 'modal')}, "Modal"), 
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

        openModal: function() {
            this.openPortal(
                React.createElement(Modal, {title: "Modal Title", closeModalCallback: this.closePortal}, 
                    "Paleo hella meditation Thundercats. Artisan Wes Anderson plaid, meggings trust fund sartorial" + ' ' +
                    "slow-carb flexitarian direct trade skateboard. Gentrify sriracha Kickstarter Godard butcher" + ' ' +
                    "McSweeney's. Etsy keffiyeh hoodie irony vinyl. Ugh VHS hella, mlkshk craft beer meh banh mi." + ' ' +
                    "Whatever normcore Truffaut sustainable lo-fi literally, Vice leggings XOXO. Wayfarers Austin" + ' ' +
                    "tattooed mlkshk asymmetrical plaid butcher, chia stumptown post-ironic."
                )
            );
        },

        handleBulkActionClick: function() {
            alert('You have selected the following items from the table:\n\n' + TableStore.getSelectedItems('tableId'));
        },

        handleLinkClick: function(link) {
            this.setState({
                selectedComponentSet: link
            });
        }
    });
});
