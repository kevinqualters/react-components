define(function(require) {
    var Helpers = require('drc/tests/helpers');
    var React = require('react');
    var Table = require('drc/table/Table');
    var TableActions = require('drc/table/TableActions');
    var TestUtils = React.addons.TestUtils;

    describe('Table', function() {
        var table;

        beforeEach(function() {
            spyOn(TableActions, 'requestData');
        });

        describe('getDefaultProps function', function() {
            it('should set the default table type to basic if no type was declared.', function() {
                Helpers.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
                table = TestUtils.renderIntoDocument(<Table />);

                expect(table.props.type).toEqual('basic');
            });
        });

        describe('getTable function', function() {
            it('should attempt to render a basic table.', function() {
                Helpers.mockReactComponent('BasicTable', {className: 'fake-basic-table'});
                table = TestUtils.renderIntoDocument(<Table type="basic" />);

                expect(React.createElement.calls.argsFor(1)[1].type).toEqual('basic');
            });

            it('should attempt to render a grouped actions table.', function() {
                Helpers.mockReactComponent('GroupedActionsTable', {className: 'fake-grouped-actions-table'});
                table = TestUtils.renderIntoDocument(<Table type="groupedActions" />);

                expect(React.createElement.calls.argsFor(1)[1]).toEqual({type: 'groupedActions'});
            });
        });
    });
});
