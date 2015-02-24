define(function(require) {
    'use strict';

    var DataMixins = require('drc/mixins/DataMixins');
    var _ = require('lodash');
    var React = require('react');
    var TableActions = require('drc/table/TableActions');
    var TableStore = require('drc/table/TableStore');
    var Utils = require('drc/utils/Utils');

    var iconClasses = {
        deselectAll: 'fa fa-minus-square-o',
        pageLeft: 'fa fa-chevron-left',
        pageRight: 'fa fa-chevron-right',
        rowsCollapsed: 'fa fa-chevron-right',
        rowsExpanded: 'fa fa-chevron-down',
        selectAll: 'fa fa fa-square-o',
        selectOn: 'fa fa-check-square-o',
        selectOff: 'fa fa-square-o',
        sortAsc: 'fa fa-sort-asc',
        sortDesc: 'fa fa-sort-desc',
        statusOn: 'fa fa-circle',
        statusOff: 'fa fa-circle-o'
    };

    return {
        displayName: 'BasicTable',

        mixins: [
            DataMixins.dataRequest,
            DataMixins.destroySelfOnUnmount(TableActions),
            DataMixins.eventSubscription(TableStore)
        ],

        quickFilterEnabled: false,

        getDefaultProps: function() {
            return {
                noResultsText: 'No results found.',
                quickFilterPlaceholder: 'Filter'
            };
        },

        getInitialState: function() {
            this.selectionEnabled = _.some(this.props.definition.cols, function(col) {return col.dataType === 'select';}) ? true : false;
            this.quickFilterEnabled = _.some(this.props.definition.cols, function(col) {return col.quickFilter === true;}) ? true : false;
            this.iconClasses = _.merge(_.clone(iconClasses), this.props.iconClasses);

            return {
                loading: true,
                data: null,
                dataError: false,
                selectedItems: {}
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
            TableActions.requestData(this.props.componentId, this.props.definition, this.props.dataFormatter, this.props.filters);
        },

        /**
         * Handle store change event.
         */
        onDataReceived: function() {
            var table = TableStore.getInstance(this.props.componentId);
            var data = table.getData();
            var colDefs = table.getColDefinitions();

            if (!data) {
                this.onError();
                return;
            }

            this.setState({
                colDefinitions: colDefs,
                colSortDirections: this.getColSortDirections(colDefs),
                dataCount: table.getDataCount(),
                data: data,
                filteredData: table.getFilteredData(),
                loading: false,
                pagination: table.getPaginationData(),
                rowClick: table.getRowClickData(),
                selectedItems: this.selectionEnabled ? table.getSelectedItems() : null,
                sortColIndex: table.getSortColIndex()
            });
        },

        /**
         * Handle request error.
         */
        onError: function() {
            this.setState({loading: false, dataError: true});
        },

        getQuickFilter: function() {
            if (!this.quickFilterEnabled || this.state.loading) {
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
                'left-control': true,
                'disabled': disableLeft,
                'hide': disableLeft && disableRight
            });
            var rightControl = cx({
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
                    React.createElement("i", {className: leftControl + ' ' + this.iconClasses.pageLeft, onClick: handlePageLeftClick}), 
                    React.createElement("i", {className: rightControl + ' ' + this.iconClasses.pageRight, onClick: handlePageRightClick})
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

        getTableRowItem: function(rowData, index) {
            var handleRowClick;
            var onMouseDown;
            var row = [];

            var hoverClass = React.addons.classSet({
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

        getTableHeaderItem: function(colData, index) {
            var icon, onClick;
            var title = colData.headerLabel;
            var headerClasses = 'no-select';

            if (colData.dataType === 'select' && this.state.data && this.state.data.length) {
                icon = this.getBulkSelectionIcon(colData);
                onClick = this.handleBulkSelectClick.bind(this, icon._store.props.title === 'Deselect All');
                headerClasses += ' select-column-th';
            }
            else if (colData.sortDirection && this.state.data && this.state.data.length) {
                icon = this.getSortIcon(index);
                onClick = this.handleSortClick.bind(this, index);
                headerClasses += ' indicator';
            }

            return (
                React.createElement("th", {className: headerClasses, 
                    title: title, 
                    key: 'tableHeader' + Utils.guid(), 
                    style: {width: colData.width}, 
                    onClick: onClick}, colData.headerLabel, 
                    icon
                )
            );
        },

        getBulkSelectionIcon: function(colData) {
            var filteredData = this.state.filteredData;
            var match = _.some(filteredData, function(data) {
                return this.state.selectedItems[data[colData.dataProperty]];
            }.bind(this));
            var iconClasses = match ? this.iconClasses.deselectAll : this.iconClasses.selectAll;

            return React.createElement("i", {className: iconClasses, title: match ? 'Deselect All' : 'Select All'});
        },

        getSortIcon: function(index) {
            var defaultIconClasses = React.addons.classSet({
                'sorting-indicator': true,
                'active': this.state.sortColIndex === index
            });
            var iconClasses = this.state.colSortDirections[index] === 'ascending' ? this.iconClasses.sortAsc + ' asc' : this.iconClasses.sortDesc + ' desc';

            return React.createElement("i", {className: defaultIconClasses + ' ' + iconClasses});
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
            var afterIcon, iconClasses;
            var contentClasses = 'content';

            // This is a select column
            if (meta.dataType && meta.dataType === 'select') {
                iconClasses = this.state.selectedItems && this.state.selectedItems[val] ? this.iconClasses.selectOn + ' on' : this.iconClasses.selectOff + ' off';

                return (
                    React.createElement("td", {className: "select-column-td no-select", 
                        title: this.state.selectedItems && this.state.selectedItems[val] ? "Deselect" : "Select", 
                        key: 'tableData' + Utils.guid(), 
                        onClick: this.handleSelectClick}, 
                        React.createElement("i", {className: iconClasses})
                    )
                );
            }

            if (meta.dataType === 'status') {
                contentClasses += ' before-icon';
                iconClasses = this.state.data[index].online ? this.iconClasses.statusOn + ' status-on' : this.iconClasses.statusOff + ' status-off';

                afterIcon = React.createElement("i", {className: 'after-icon ' + iconClasses});
            }
            hoverValue = hoverValue || val;

            return (
                React.createElement("td", {className: "status", key: 'tableData' + Utils.guid()}, 
                    React.createElement("span", {className: contentClasses, title: hoverValue}, val), 
                    afterIcon
                )
            );
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
         * @param {Object} e - Simulated React event.
         */
        onMouseDown: function(e) {
            this.mouseDownX = e.clientX;
        },

        /**
         * Will trigger the rowClick's callback function if a drag hasn't occurred.
         * @param {Object} e - Simulated React event.
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
        },

        /**
         * Bulk toggle selection for table rows.
         * @param {Boolean} deselect - If there are selected items in the filtered data set, we need to deselect them.
         * @param {Object} e - Simulated React event.
         */
        handleBulkSelectClick: function(deselect, e) {
            e.stopPropagation();
            TableActions.toggleBulkSelect(this.props.componentId, deselect);
        },

        /**
         * Toggle selection for a single table row.
         * @param {Object} e - Simulated React event.
         */
        handleSelectClick: function(e) {
            e.stopPropagation();
            TableActions.toggleRowSelect(this.props.componentId, $(e.currentTarget).closest('tr')[0].rowIndex);
        }
    };
});
