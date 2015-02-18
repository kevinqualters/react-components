define(function(require) {
    'use strict';

    var BaseTable = require('drc/table/BaseTable');
    var _ = require('lodash');
    var Moment = require('moment');
    var React = require('react');
    var Utils = require('drc/utils/Utils');

    /**
     * Table that groups flow actions by day. Selecting day row expands
     * the specific actions below that occurred on that day.
     */
    var GroupedActionsTable = {
        clobberBaseTable: {
            iconClasses: {
                rowsCollapsed: 'fa fa-chevron-right',
                rowsExpanded: 'fa fa-chevron-down',
                pageLeft: 'fa fa-chevron-left',
                pageRight: 'fa fa-chevron-right',
                sortAsc: 'fa fa-sort-asc',
                sortDesc: 'fa fa-sort-desc',
                statusOn: 'fa fa-circle',
                statusOff: 'fa fa-circle-o'
            },

            getTableRowItem: function(rowData, index) {
                var rows = [];
                var rowDataElements = [];

                // Build the table data elements for the table row
                _.forIn(this.state.colDefinitions, function(val, key) {
                    rowDataElements.push(this.getTableData(rowData, val, index));
                }.bind(this));

                // Build the table row element
                rows.push(
                    <tr data-index={index}
                        key={'tableRow' + Utils.guid()}
                        className="hover-enabled text-select"
                        onClick={this.handleGroupRowClick}>{rowDataElements}
                    </tr>
                );

                // If this table row has been clicked (selected), create the nested table rows if they exist.
                if (this.state.selectedIndex === index) {
                    _.each(rowData.actions, function(action) {
                        var subRowData = [];

                        _.forIn(this.state.colDefinitions, function(val, key) {
                            subRowData.push(this.getNestedRowTableData(action, val));
                        }.bind(this));

                        rows.push(
                            <tr data-flowid={action.flowID}
                                key={'tableRow' + Utils.guid()}
                                className="hover-enabled text-select sub-action"
                                onClick={this.handleRowClick}>{subRowData}
                            </tr>
                        );
                    }, this);
                }

                return rows;
            },

            getTableData: function(rowData, meta, index) {
                var val = rowData[meta.dataProperty];
                var beforeVal, statusIconClasses, expandedRowIndicatorClasses;
                var spanClasses = React.addons.classSet({
                    content: true,
                    'group-date': meta.dataProperty === 'groupDate'
                });

                if (meta.dataType === 'time') {
                    val = val ? Moment(val).format(meta.timeFormat) : "--";
                }

                if (meta.dataProperty === 'duration') {
                    val = this.calculateDurationString(val);
                }
                else if (meta.dataProperty === 'groupDate') {
                    // Date has count and chevron, but not in a sep column.
                    statusIconClasses = this.state.selectedIndex === index ? this.iconClasses.rowsExpanded : this.iconClasses.rowsCollapsed;

                    expandedRowIndicatorClasses = React.addons.classSet({
                        'before-icon': true,
                        'expanded-row-indicator': true,
                        inactive: this.state.selectedIndex !== index
                    });

                    beforeVal = <span className={expandedRowIndicatorClasses}>
                                    {rowData.actions.length}<i className={statusIconClasses} />
                                </span>;
                }

                return (
                    <td key={'tableData' + Utils.guid()}>
                        {beforeVal}
                        <span className={spanClasses} title={val}>{val}</span>
                    </td>
                );
            }
        },
        addToBaseTable: {
            componentDidUpdate: function() {
                if (this.state.selectedIndex > -1) {
                    // table rows don't allow animation, must wrap to achieve, or fadeIn/out
                    $('tr.sub-action')
                        .find('td')
                        .wrapInner('<div class="wrap-inner" />')
                        .parent()
                        .show()
                        .find('td > div')
                        .slideDown(200, function() {
                            var $set = $(this);
                            $set.replaceWith($set.contents());
                        });
                }
            },

            getNestedRowTableData: function(action, meta) {
                var val = '--';
                var spanClasses = React.addons.classSet({
                    content: true,
                    'group-date': meta.dataProperty === 'groupDate'
                });

                if (!action.start || !action.end) {
                    return;
                }

                switch (meta.dataProperty) {
                    case 'groupDate':
                        val = Utils.calculateTimeString(action.start, action.end);
                        break;
                    case 'duration':
                        val = this.calculateDurationString(new Date(action.end).getTime() - new Date(action.start).getTime());
                        break;
                    case 'totalCount':
                        val = action.actionCount;
                        break;
                }

                return (
                    <td key={'tableData' + Utils.guid()}>
                        <span className={spanClasses} title={val}>{val}</span>
                    </td>
                );
            },

            calculateDurationString: function(interval) {
                return String(Math.max(1, Math.ceil(interval / 60 / 1000 ))) + 'm';
            },

            handleGroupRowClick: function(e) {
                // Don't use e.target.rowIndex here, as it changes with nested rows. Use the hard coded data index instead.
                var index = $(e.currentTarget).data('index');

                this.setState({
                    selectedIndex: this.state.selectedIndex === index ? -1 : index
                });
            }
        }
    };

    return Utils.extendReactClass(BaseTable, GroupedActionsTable.clobberBaseTable, GroupedActionsTable.addToBaseTable);
});
