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
                        <div className="component">
                            <PieChart definition={pieChartDefinition}
                                      componentId={'pieChartId'}
                                      key={'pieChartId'}
                                      loadingIconClasses={['icon', 'ion-loading-c']} />
                        </div>
                    );
                    break;
                case 'search':
                    componentSet = (
                        <Search url={'/test/search'} onSelect={searchSubmitCallback} isFullDataResponse={true} minLength={1}/>
                    );
                    break;
                case 'table':
                    componentSet = (
                        <div className="component">
                            <Table definition={tableDefinition}
                                   componentId='tableId'
                                   key='tableId'
                                   loadingIconClasses={['icon', 'ion-loading-c']}
                                   quickFilterPlaceholder='Quick Filter' />
                        </div>
                    );
            }
            return (
                <div className="app-component">
                    <div id="header-component">
                        <img id="application-logo" src="images/dataminr_logo_white-01.png" />
                        <div className="header-divider"></div>
                        <div className="application-description">
                            <a href="http://facebook.github.io/react/" target="_blank" className="react"><img src="images/react_logo.png" /><span>React Components</span></a>
                            <a href="https://facebook.github.io/flux/" target="_blank" className="flux"><img src="images/flux_logo.svg" /><span>Flux Architecture</span></a>
                        </div>
                    </div>
                    <div className="sidebar">
                        <ul className="nav">
                            <li className={this.state.selectedComponentSet === 'piechart' ? 'active' : null}
                                onClick={this.handleLinkClick.bind(this, 'piechart')}>Pie Chart</li>
                            <li className={this.state.selectedComponentSet === 'search' ? 'active' : null}
                                onClick={this.handleLinkClick.bind(this, 'search')}>Search</li>
                            <li className={this.state.selectedComponentSet === 'table' ? 'active' : null}
                                onClick={this.handleLinkClick.bind(this, 'table')}>Table</li>
                        </ul>
                    </div>
                    <div className="content-component">
                        {componentSet}
                    </div>
                </div>
            );
        },

        handleLinkClick: function(link) {
            this.setState({
                selectedComponentSet: link
            });
        }
    });
});
