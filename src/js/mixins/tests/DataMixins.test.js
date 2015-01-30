define(function(require) {
    var DataMixins = require('mixins/DataMixins');
    var React = require('react');

    var TestUtils = React.addons.TestUtils;

    describe('DataMixins', function() {
        var MockActions = {
            destroyInstance: function() {}
        };
        var MockStore = {
            on: function() {},
            removeListener: function() {}
        };

        var MockChild = React.createClass({
            mixins: [
                DataMixins.dataRequest,
                DataMixins.destroySelfOnUnmount(MockActions),
                DataMixins.eventSubscription(MockStore)
            ],
            render: function() {
                return <div>Mock Child</div>;
            },
            requestData: function() {}
        });
        var Mock = React.createClass({
            getInitialState: function() {
                return {
                    updated: false,
                    filters: {
                        test: 'unchanged'
                    }
                };
            },

            render: function() {
                return <MockChild ref='mockChild' filters={this.state.filters} />;
            }
        });
        var mock;

        beforeEach(function() {
            mock = TestUtils.renderIntoDocument(<Mock />);
        });

        describe('dataRequest mixin', function() {
            describe('componentWillUpdate function when filters change', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    mock.setState({
                        updated: true,
                        filters: {
                            test: 'changed'
                        }
                    });
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data when filters have changed when updating', function(done) {
                    // The first call is from the initial mount.
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(2);
                    done();
                });
            });

            describe('componentWillUpdate function when filters do not change', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    mock.setState({
                        updated: true
                    });
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should not request data when filters have not changed when updating', function(done) {
                    // The single call is from the initial mount.
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(1);
                    done();
                });
            });

            describe('componentDidMount function', function() {
                beforeEach(function (done) {
                    spyOn(mock.refs.mockChild, 'requestData');
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should request data when mounting', function(done) {
                    expect(mock.refs.mockChild.requestData.calls.count()).toEqual(1);
                    done();
                });
            });
        });

        describe('destroySelfOnUnmount mixin', function() {
            describe('componentWillUnmount function', function() {
                beforeEach(function (done) {
                    spyOn(MockActions, 'destroyInstance');
                    mock.refs.mockChild.componentWillUnmount();
                    setTimeout(function() {
                        done();
                    }, 1);
                });

                it('should trigger an action to destroy itself when unmounting', function(done) {
                    expect(MockActions.destroyInstance).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('eventSubscription mixin', function() {
            describe('componentDidMount function', function() {
                it('should add change and fail listeners to the store when mounting', function() {
                    spyOn(MockStore, 'on');
                    mock.refs.mockChild.componentDidMount();
                    expect(MockStore.on.calls.count()).toEqual(2);
                });
            });

            describe('componentWillUnmount function', function() {
                it('should remove change and fail listeners from the store when unmounting', function() {
                    spyOn(MockStore, 'removeListener');
                    mock.refs.mockChild.componentWillUnmount();
                    expect(MockStore.removeListener.calls.count()).toEqual(2);
                });
            });
        });
    });
});
