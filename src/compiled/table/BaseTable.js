define(function(require) {
    'use strict';

    var DataMixins = require('drc/mixins/DataMixins');
    var _ = require('lodash');
    var React = require('react');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    return {
        displayName: 'BasicTable',

        quickFilterEnabled: false,

        getDefaultProps: function() {
            return {
                noResultsText: 'No results found.',
                quickFilterPlaceholder: 'Filter'
            };
        },

        mixins: [
            DataMixins.dataRequest,
            DataMixins.destroySelfOnUnmount(TableActions),
            DataMixins.eventSubscription(TableStore)
        ],

        getInitialState: function() {
            this.quickFilterEnabled = _.some(this.props.definition.cols, function(col) {return col.quickFilter === true;}) ? true : false;

            return {
                loading: true,
                data: null,
                dataError: false
            };
        },

        render: function() {
            var containerClasses = React.addons.classSet({
                    'data-container': true,
                    'masked-darker': this.state.loading || this.state.dataError,
                    error: this.state.dataError
                }),
                thead, tbody, paginationControls, noResults;

            var quickFilter = this.getQuickFilter();

            if (this.state.data) {
                thead = this.state.colDefinitions.map(this.getTableHeaderItem);
                tbody = this.state.data.map(this.getTableRowItem);
                paginationControls = this.getPaginationControls();
            }

            if (this.state.data && !this.state.data.length) {
                noResults = React.createElement("div", {className: "no-results"}, this.props.noResultsText);
            }

            return (
                React.createElement("div", {className: "data-component table-component no-select"}, 
                    React.createElement("div", {className: containerClasses}, 
                        React.createElement("i", {className: Utils.getLoaderClasses(this.state.loading, this.props.loadingIconClasses)}), 
                        quickFilter, 
                        paginationControls, 
                        React.createElement("table", null, 
                            React.createElement("thead", null, thead), 
                            React.createElement("tbody", null, tbody)
                        ), 
                        noResults
                    )
                )
            );
        },

        requestData: function() {
            this.setState({
                loading: true,
                dataError: false
            });
            TableActions.requestData(this.props.componentId, this.props.definition, this.props.filters);
        },

        /**
         * Handle store change event.
         */
        onDataReceived: function() {
            var data = TableStore.getData(this.props.componentId);
            var dataCount = TableStore.getDataCount(this.props.componentId);
            var colDefinitions = TableStore.getColDefinitions(this.props.componentId);
            var sortColIndex = TableStore.getSortColIndex(this.props.componentId);
            var rowClick = TableStore.getRowClickData(this.props.componentId);
            var pagination = TableStore.getPaginationData(this.props.componentId);

            if (!data) {
                this.onError();
                return;
            }

            this.setState({
                loading: false,
                data: data,
                dataCount: dataCount,
                colDefinitions: colDefinitions,
                sortColIndex: sortColIndex,
                pagination: pagination,
                rowClick: rowClick,
                colSortDirections: this.getColSortDirections(colDefinitions)
            });
        },

        /**
         * Handle request error.
         */
        onError: function() {
            this.setState({loading: false, dataError: true});
        },

        getQuickFilter: function() {
            if (!this.quickFilterEnabled) {
                return null;
            }

            return React.createElement("input", {ref: "filter", className: "quick-filter", type: "text", placeholder: this.props.quickFilterPlaceholder, onChange: this.handleQuickFilterChange});
        },

        getPaginationControls: function() {
            if (!this.state.data || !this.state.data.length || !this.state.pagination) {
                return null;
            }

            var handlePageLeftClick;
            var handlePageRightClick;
            var len = this.state.dataCount;
            var cursor = this.state.pagination.cursor + 1;
            var size = this.state.pagination.size;
            var lastDisplayedVal = cursor + size - 1 > len ? len : cursor + size - 1;

            var disableLeft = cursor === 1;
            var disableRight = cursor + size - 1 >= len;

            if (!disableLeft) {
                handlePageLeftClick = this.handlePageLeftClick;
            }

            if (!disableRight) {
                handlePageRightClick = this.handlePageRightClick;
            }

            var cx = React.addons.classSet;
            var leftControl = cx({
                'icon': true,
                'ion-chevron-left': true,
                'left-control': true,
                'disabled': disableLeft,
                'hide': disableLeft && disableRight
            });
            var rightControl = cx({
                'icon': true,
                'ion-chevron-right': true,
                'right-control': true,
                'disabled': disableRight,
                'hide': disableLeft && disableRight
            });

            return (
                React.createElement("div", {className: "pagination-controls no-select clear-fix"}, 
                    cursor, 
                    React.createElement("span", null, "-"), 
                    lastDisplayedVal, 
                    React.createElement("span", null, "  of  "), 
                    this.state.dataCount, 
                    React.createElement("i", {className: leftControl, onClick: handlePageLeftClick}), 
                    React.createElement("i", {className: rightControl, onClick: handlePageRightClick})
                )
            );
        },

        getColSortDirections: function(colDefinitions) {
            var colSortDirections = [];

            colDefinitions.map(function(colData) {
                var direction = colData.sortDirection;

                if (direction === 'ascending' || direction === 'descending') {
                    colSortDirections.push(direction);
                }
                else {
                    colSortDirections.push('off');
                }
            });

            return colSortDirections;
        },

        getTableHeaderItem: function(colData, index) {
            var icon = null;
            var sortActive;
            var handleSortClick;
            var thStyle = {
                width: colData.width
            };
            var headerClasses;

            if (this.state.data && this.state.data.length > 1 && typeof this.state.sortColIndex === 'number') {
                sortActive = this.state.sortColIndex === index;
                if (this.state.colSortDirections[index] === 'ascending') {
                    icon = this.getIcon('ascending', sortActive);
                }
                else if (this.state.colSortDirections[index] === 'descending') {
                    icon = this.getIcon('descending', sortActive);
                }
            }

            headerClasses = React.addons.classSet({
                'indicator': !!icon,
                'no-select': true
            });

            if (icon) {
                handleSortClick = this.handleSortClick;
            }

            return (
                React.createElement("th", {className: headerClasses, 
                    key: 'tableHeader' + Utils.guid(), 
                    style: thStyle, 
                    onClick: handleSortClick ? handleSortClick.bind(this, index) : undefined}, colData.headerLabel, " ", icon
                )
            );
        },

        getTableRowItem: function(rowData, index) {
            var handleRowClick;
            var onMouseDown;
            var row = [];

            var cx = React.addons.classSet;
            var hoverClass = cx({
                'hover-enabled': this.state.rowClick,
                'text-select': true,
                'error-row': rowData.isError
            });

            _.forIn(this.state.colDefinitions, function(val) {
                row.push(this.getTableData(rowData[val.dataProperty], val, val.hoverProperty ? rowData[val.hoverProperty] : null, index));
            }.bind(this));

            if (this.state.rowClick) {
                handleRowClick = this.handleRowClick;
                onMouseDown = this.onMouseDown;
            }
            return (
                React.createElement("tr", {key: 'tableRow' + Utils.guid(), 
                    className: hoverClass, 
                    onClick: handleRowClick, 
                    onMouseDown: onMouseDown}, 
                    row
                )
            );
        },

        /**
         * Returns the markup necessary to display a cell in the table
         * @param  {Mixed} val         The value for the current cell
         * @param  {Object} meta       Details about the value (format, type, etc)
         * @param  {Mixed=} hoverValue Optional value to show in hover state of cell
         * @param {Number} index
         * @return {Object}            Cell markup
         */
        getTableData: function(val, meta, hoverValue, index) {
            var cx = React.addons.classSet;
            var afterIcon, statusIconClasses;

            if (meta.dataType === 'status') {
                statusIconClasses = cx({
                    'fa': true,
                    'fa-circle': this.state.data[index].online,
                    'fa-circle-o': !this.state.data[index].online
                });

                afterIcon = (React.createElement("span", {className: "after-icon"}, React.createElement("i", {className: statusIconClasses})));
            }
            hoverValue = hoverValue || val;

            return (
                React.createElement("td", {className: "status", key: 'tableData' + Utils.guid()}, 
                    React.createElement("span", {className: "content", title: hoverValue}, val), 
                    afterIcon
                )
            );
        },

        getIcon: function(direction, sortActive) {
            var iconClasses = React.addons.classSet({
                'sorting-indicator': true,
                'fa': true,
                'fa-sort-asc': direction === 'ascending',
                'fa-sort-desc': direction === 'descending',
                'active': sortActive
            });

            return React.createElement("i", {className: iconClasses});
        },

        handleQuickFilterChange: function(e) {
            TableActions.filter(this.props.componentId, e.target.value);
        },

        handlePageLeftClick: function() {
            TableActions.paginate(this.props.componentId, 'left');
        },

        handlePageRightClick: function() {
            TableActions.paginate(this.props.componentId, 'right');
        },

        handleSortClick: function(index) {
            var direction;

            if (this.state.sortColIndex === index) {
                direction = this.state.colSortDirections[index] === 'ascending' ? 'descending' : 'ascending';
            }
            else {
                direction = this.state.colSortDirections[index];
            }

            TableActions.sortChange(this.props.componentId, index, direction);
        },

        /**
         * Tracks the mouse down x value to detect dragging on a table row to highlight text.
         * @param {Object} e - The event simulated by React.
         */
        onMouseDown: function(e) {
            this.mouseDownX = e.clientX;
        },

        /**
         * Will trigger the rowClick's callback function if a drag hasn't occurred.
         * @param {Object} e - The event simulated by React.
         */
        handleRowClick: function(e) {
            // Do not allow the click functionality to be triggered when the user is highlighting text.
            if (this.mouseDownX && Math.abs(this.mouseDownX - e.clientX) > 10) {
                this.mouseDownX = null;
                return;
            }
            if (typeof this.state.rowClick.callback !== 'function') {
                throw new Error('The rowClick property in a table declaration must be a function and was received with a type of ' +
                    typeof this.state.rowClick + '.');
            }
            else {
                this.state.rowClick.callback(e, this.props, this.state);
            }
        }
    };
});
