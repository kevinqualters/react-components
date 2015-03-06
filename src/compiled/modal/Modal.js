define(function(require) {
    'use strict';

    var React = require('react');
    var StringUtils = require('drc/utils/StringUtils');
    var Utils = require('drc/utils/Utils');

    var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

    var iconClasses = {
        close: 'fa fa-close'
    };

    return React.createClass({
        displayName: 'Modal',

        propTypes: {
            closeModalCallback: React.PropTypes.func,
            title: React.PropTypes.string
        },

        getInitialState: function() {
            this.iconClasses = _.merge(_.clone(iconClasses), this.props.iconClasses);

            return null;
        },

        componentDidMount: function() {
            this.refs.content.getDOMNode().focus();
        },

        componentDidUpdate: function() {
            this.refs.content.getDOMNode().focus();
        },

        render: function() {
            return (
                React.createElement("div", {onClick: this.backgroundClickHandler, id: "modal-container", 'data-clickcatcher': "true"}, 
                    React.createElement("div", {ref: "content", className: "content", tabIndex: "-1", onKeyDown: this.keyDownHandler}, 
                        React.createElement("div", {className: "header"}, 
                            React.createElement("span", {className: "title"}, this.props.title), 
                            React.createElement("span", {className: "close", onClick: this.closeModelHandler}, 
                                React.createElement("span", {className: "close-text"}, "esc to close"), " | ", React.createElement("i", {className: this.iconClasses.close})
                            )
                        ), 
                        React.createElement("div", {className: "body"}, 
                            this.props.children
                        )
                    )
                )
                );
        },

        /**
         * If the key pressed is the escape key, the close modal handler will be called.
         * @param {object} e - The simulated React event.
         */
        keyDownHandler: function(e) {
            // escape key pressed
            if (e.keyCode === 27) {
                this.closeModelHandler(e);
            }
        },

        /**
         * Captures any click event outside the modal and calls the close modal handler.
         * @param e - The simulated React event.
         */
        backgroundClickHandler: function(e) {
            if (e.target.getAttribute('data-clickcatcher')) {
                this.closeModelHandler(e);
            }
        },

        /**
         * Triggered when clicking outside the modal, clicking on the close button, and when pressing escape.
         * @param e - The simulated React event.
         */
        closeModelHandler: function(e) {
            e.stopPropagation();

            if (typeof this.props.closeModalCallback === 'function') {
                this.props.closeModalCallback();
            }
            else {
                React.unmountComponentAtNode(this.getDOMNode().parentNode);
            }
        }
    });
});
