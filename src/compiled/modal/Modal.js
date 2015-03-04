define(function(require) {
    'use strict';

    var React = require('react');
    var StringUtils = require('drc/utils/StringUtils');
    var Utils = require('drc/utils/Utils');

    return React.createClass({
        displayName: 'Modal',

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
                                React.createElement("span", {className: "close-text"}, "esc to close"), " | ", React.createElement("i", {className: "icon ion-close-round"}))
                        ), 
                        React.createElement("div", {className: "body"}, 
                            this.props.children
                        )
                    )
                )
            );
        },

        keyDownHandler: function(e) {
            if (e.keyCode === 27) {
                this.closeModelHandler(e);
            }
        },

        backgroundClickHandler: function(e) {
            if (e.target.getAttribute('data-clickcatcher')) {
                this.closeModelHandler(e);
            }
        },

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
