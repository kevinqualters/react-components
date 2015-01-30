define(function(require) {
    'use strict';

    var Utils = require('Utils');
    var Moment = require('moment');
    var React = require('react');
    var Table = require('Table');

    /**
     * Get formatted time string given the start and end times
     * @param  {int} start        Start timestamp
     * @param  {int} end          End timestamp
     * @param  {bool} includeDate Whether time should include date
     * @return {String}           Formatted time optionally prepended by date
     */
    function calculateTimeString(start, end, includeDate) {
        var format = 'h:mm A',
            startTime = Moment(start).format(format),
            endTime = Moment(end).format(format);

        var date = includeDate ? Moment(start).format('MMM Do,') : '';

        //If all actions occured at the same minute, just show a single minute, not a range
        if(startTime === endTime){
            return date + " " + startTime;
        }

        return date + " " + startTime + ' - ' + endTime;
    }

    /**
     * Table that groups flow actions by day. Selecting day row expands
     * the specific actions below that occurred on that day.
     */
    var GroupedActionsTable = _.extend(Table.Base, {
        getInitialState: function() {
            return {
                calculateTimeString: calculateTimeString
            };
        },

        getTableRowItem: function(rowData, index) {
            var rows = [];

            var cx = React.addons.classSet;
            var hoverClass = cx({
                'hover-enabled': true,
                'text-select': true
            });

            // create group row
            var groupRowColumns = [];
            _.forIn(this.state.colDefinitions, function(val, key) {
                groupRowColumns.push(this.getTableData(rowData, val, index));
            }.bind(this));
            rows.push(<tr data-index={index}
            key={'tableRow' + Utils.guid()}
            className={hoverClass}
            onClick={this.handleGroupRowClick}>{groupRowColumns}</tr>);

            if (this.state.selectedIndex === index) {
                var actionClasses = cx({
                    'hover-enabled': true,
                    'text-select': true,
                    'sub-action': true
                });

                // if sub actions exist, create individual rows for each
                _.each(rowData.actions, function(action) {
                    var actionRowColumns = [];

                    _.forIn(this.state.colDefinitions, function(val, key) {
                        actionRowColumns.push(this.getActionColumn(action, val));
                    }.bind(this));

                    rows.push(<tr data-flowid={action.flowID}
                    key={'tableRow' + Utils.guid()}
                    className={actionClasses} onClick={this.handleRowClick}>{actionRowColumns}</tr>);
                }, this);
            }

            return rows;
        },

        getTableData: function(rowData, meta, index) {
            var val = rowData[meta.dataProperty];

            if (meta.dataType === 'time') {
                val = val ? Moment(val).format(meta.timeFormat) : "--";
            }

            if (meta.dataProperty === 'duration') {
                val = this.calculateDurationString(val);
            }
            else if (meta.dataProperty === 'groupDate') {
                // date has count and chevron, but not in a sep column
                var statusIconClasses = React.addons.classSet({
                    'icon': true,
                    'ion-chevron-right': this.state.selectedIndex !== index,
                    'ion-chevron-down': this.state.selectedIndex === index
                });

                var expandedRowIndicatorClasses = React.addons.classSet({
                    'before-icon': true,
                    'expanded-row-indicator': true,
                    inactive: this.state.selectedIndex !== index
                });

                var beforeVal = <span className={expandedRowIndicatorClasses}>
                                    {rowData.actions.length}<i className={statusIconClasses} />
                </span>;

                return (
                    <td key={'tableData' + Utils.guid()}>
                        {beforeVal}
                        <span className="content group-date" title={val}>{val}</span>
                    </td>
                    );
            }

            return <td key={'tableData' + Utils.guid()}><span className="content" title={val}>{val}</span></td>;
        },

        getActionColumn: function(action, meta) {
            var val = '--';

            if (action.start && action.end) {
                if (meta.dataProperty === 'groupDate') {
                    val = calculateTimeString(action.start, action.end);
                    return (
                        <td key={'tableData' + Utils.guid()}>
                            <span className="content group-date" title={val}>{val}</span>
                        </td>
                        );
                }
                else if (meta.dataProperty === 'duration') {
                    val = this.calculateDurationString(new Date(action.end).getTime() - new Date(action.start).getTime());
                }
                else if (meta.dataProperty === 'totalCount') {
                    val = action.actionCount;
                }
            }

            return <td key={'tableData' + Utils.guid()}><span className="content" title={val}>{val}</span></td>;
        },

        calculateDurationString: function(interval) {
            return String(Math.max(1, Math.ceil(interval / 60 / 1000 ))) + 'm';
        },

        handleGroupRowClick: function(e) {
            // don't use e.target.rowIndex here, as it changes with nested child rows.
            // use the hard coded data index instead
            var index = $(e.currentTarget).data('index');

            this.setState({
                selectedIndex: this.state.selectedIndex === index ? -1 : index
            });
        }
    });

    return React.createClass({
        mixins: [GroupedActionsTable],
        componentDidUpdate: function() {
            if (this.state.selectedIndex > -1) {
                // tr's don't allow animation, must wrap to achieve, or fadeIn/out
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
        }
    });
});
