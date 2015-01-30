define(function() {
    'use strict';

    return {
        /**
         * Used by all data components that make server requests to get their data. It is not useful for within
         * components that have stores that are merely monitoring state.
         */
        dataRequest: {
            /**
             * Requests data for a component when the filter property changes. The setTimeout insures that
             * the currently dispatched action has completed the dispatching process before the request data
             * action is kicked off.
             * @param {object} nextProps - The set of properties that will be on the component after it updates.
             */
            componentWillUpdate: function(nextProps) {
                if (this.props.filters !== nextProps.filters) {
                    setTimeout(function() {
                        this.requestData();
                    }.bind(this), 0);
                }
            },

            /**
             * Requests data for a component once it has been mounted in the DOM. The setTimeout insures that
             * the currently dispatched action has completed the dispatching process before the request data
             * action is kicked off.
             */
            componentDidMount: function() {
                setTimeout(function() {
                    this.requestData();
                }.bind(this), 0);
            }
        },

        /**
         * This mixin insures that components will remove themselves from the stores when they unmount from the DOM.
         * The destroy functionality can be useful for components that create objects in a collection within a store,
         * even if it is just managing state for the client with no persistence layer.
         * @param {object} actions - The object returned from the action file associated with the component.
         * @returns {{componentWillUnmount: componentWillUnmount}}
         */
        destroySelfOnUnmount: function(actions) {
            return {
                /**
                 * Removes all data related to a component once it has been removed (unmounted) from the DOM. The
                 * setTimeout insures that the currently dispatched action has completed the dispatching process
                 * before the destroy instance action is kicked off.
                 */
                componentWillUnmount: function() {
                    setTimeout(function() {
                        actions.destroyInstance(this.props.componentId);
                    }.bind(this), 0);
                }
            };
        },

        /**
         * Used to add and remove the listeners required when requesting data from the server.
         * @param {object} store - The object returned from the store file associated with the component.
         * @returns {{componentDidMount: componentDidMount, componentWillUnmount: componentWillUnmount}}
         */
        eventSubscription: function(store) {
            return {
                /**
                 * Adds the listeners required when requesting data from the server.
                 */
                componentDidMount: function() {
                    store.on('change:' + this.props.componentId, this.onDataReceived);
                    store.on('fail:' + this.props.componentId, this.onError);
                },

                /**
                 * Removes the listeners required when requesting data from the server.
                 */
                componentWillUnmount: function() {
                    store.removeListener('change:' + this.props.componentId, this.onDataReceived);
                    store.removeListener('fail:' + this.props.componentId, this.onError);
                }
            };
        }
    };
});
