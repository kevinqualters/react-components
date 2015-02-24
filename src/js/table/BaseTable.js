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
                noResults = <div className="no-results">{this.props.noResultsText}</div>;
            }

            return (
                <div className="data-component table-component no-select">
                    <div className={containerClasses}>
                        <i className={Utils.getLoaderClasses(this.state.loading, this.props.loadingIconClasses)}></i>
                        {quickFilter}
                        {paginationControls}
                        <table>
                            <thead>{thead}</thead>
                            <tbody>{tbody}</tbody>
                        </table>
                        {noResults}
                    </div>
                </div>
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
                colSortDirections: this.getColSortDirections(colDefinitions),
                selectedItems: this.selectionEnabled ? TableStore.getSelectedItems(this.props.componentId) : null
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

            return <input ref="filter" className="quick-filter" type="text" placeholder={this.props.quickFilterPlaceholder} onChange={this.handleQuickFilterChange} />;
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
                <div className="pagination-controls no-select clear-fix">
                    {cursor}
                    <span>-</span>
                    {lastDisplayedVal}
                    <span>&nbsp; of &nbsp;</span>
                    {this.state.dataCount}
                    <i className={leftControl + ' ' + this.iconClasses.pageLeft} onClick={handlePageLeftClick} />
                    <i className={rightControl + ' ' + this.iconClasses.pageRight} onClick={handlePageRightClick} />
                </div>
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
            var sortIndicator = null;
            var sortActive, handleSortClick, iconClasses, filteredData, match;
            var thStyle = {
                width: colData.width
            };
            var headerClasses;

            if (this.state.data && this.state.data.length > 1 && typeof this.state.sortColIndex === 'number') {
                sortActive = this.state.sortColIndex === index;
                if (this.state.colSortDirections[index] === 'ascending') {
                    sortIndicator = this.getSortIndicator('ascending', sortActive);
                }
                else if (this.state.colSortDirections[index] === 'descending') {
                    sortIndicator = this.getSortIndicator('descending', sortActive);
                }
            }

            headerClasses = React.addons.classSet({
                'indicator': !!sortIndicator,
                'no-select': true,
                'select-column-th': colData.iconClasses && typeof colData.iconClasses === 'object'
            });

            if (sortIndicator) {
                handleSortClick = this.handleSortClick;
            }

            if (colData.dataType === 'select') {
                filteredData = TableStore.getFilteredData(this.props.componentId);

                match = _.some(filteredData, function(data) {
                    return this.state.selectedItems[data[colData.dataProperty]];
                }.bind(this));

                iconClasses = match ? this.iconClasses.deselectAll : this.iconClasses.selectAll;

                return (
                    <th className={headerClasses}
                        title={match ? "Deselect All" : "Select All"}
                        key={'tableHeader' + Utils.guid()}
                        style={thStyle}
                        onClick={this.handleBulkSelectToggleClick.bind(this, match)}>
                        <i className={iconClasses} />
                    </th>
                );
            }

            return (
                <th className={headerClasses}
                    title={colData.headerLabel}
                    key={'tableHeader' + Utils.guid()}
                    style={thStyle}
                    onClick={handleSortClick ? handleSortClick.bind(this, index) : undefined}>{colData.headerLabel}
                    {sortIndicator}
                </th>
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
                <tr key={'tableRow' + Utils.guid()}
                    className={hoverClass}
                    onClick={handleRowClick}
                    onMouseDown={onMouseDown}>
                    {row}
                </tr>
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
            var afterIcon, iconClasses;
            var contentClasses = 'content';

            // This is a select column
            if (meta.dataType && meta.dataType === 'select') {
                iconClasses = this.state.selectedItems && this.state.selectedItems[val] ? this.iconClasses.selectOn + ' on' : this.iconClasses.selectOff + ' off';

                return (
                    <td className="select-column-td no-select"
                        title={this.state.selectedItems && this.state.selectedItems[val] ? "Deselect" : "Select"}
                        key={'tableData' + Utils.guid()}
                        onClick={this.handleSelectToggleClick}>
                        <i className={iconClasses}></i>
                    </td>
                );
            }

            if (meta.dataType === 'status') {
                contentClasses += ' before-icon';
                iconClasses = this.state.data[index].online ? this.iconClasses.statusOn + ' status-on' : this.iconClasses.statusOff + ' status-off';

                afterIcon = <i className={'after-icon ' + iconClasses} />;
            }
            hoverValue = hoverValue || val;

            return (
                <td className="status" key={'tableData' + Utils.guid()}>
                    <span className={contentClasses} title={hoverValue}>{val}</span>
                    {afterIcon}
                </td>
            );
        },

        getSortIndicator: function(direction, sortActive) {
            var iconClasses = React.addons.classSet({
                'sorting-indicator': true,
                'active': sortActive
            });
            var defaultIconClasses = direction === 'ascending' ? this.iconClasses.sortAsc + ' asc' : this.iconClasses.sortDesc + ' desc';

            return <i className={iconClasses + ' ' + defaultIconClasses}></i>;
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
        },

        /**
         * Bulk toggle selection for table rows.
         * @param {Boolean} deselect - If there are selected items in the filtered data set, we need to deselect them.
         * @param {Object} e - Simulated React event.
         */
        handleBulkSelectToggleClick: function(deselect, e) {
            e.stopPropagation();
            TableActions.toggleBulkSelect(this.props.componentId, deselect);
        },

        /**
         * Toggle selection for a single table row.
         * @param {Object} e - Simulated React event.
         */
        handleSelectToggleClick: function(e) {
            e.stopPropagation();
            TableActions.toggleRowSelect(this.props.componentId, $(e.currentTarget).closest('tr')[0].rowIndex);
        }
    };
});
