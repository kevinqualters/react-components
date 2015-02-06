define(function(require) {
    'use strict';

    var React = require('react');
    var BaseTable = require('drc/table/BaseTable');
    var BasicTable = require('drc/table/BasicTable');
    var GroupedActionsTable = require('drc/table/GroupedActionsTable');

    var TABLE_TYPES = {
        BASIC: 'basic',
        GROUPED_ACTIONS: 'groupedActions'
    };

    return React.createClass({
        getDefaultProps: function() {
            return {
                type: 'basic'
            };
        },

        propTypes: {
            type: React.PropTypes.oneOf([TABLE_TYPES.BASIC, TABLE_TYPES.GROUPED_ACTIONS])
        },

        getTable: function() {
            switch (this.props.type) {
                case TABLE_TYPES.BASIC:
                    return React.createElement(BasicTable, React.__spread({},  this.props));
                    break;
                case TABLE_TYPES.GROUPED_ACTIONS:
                    return React.createElement(GroupedActionsTable, React.__spread({},  this.props));
                    break;
            }
        },

        render: function() {
            return React.createElement("div", null, this.getTable());
        }
    });
});
