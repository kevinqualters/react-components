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
                <div onClick={this.backgroundClickHandler} id="modal-container" data-clickcatcher="true">
                    <div ref="content" className="content" tabIndex="-1" onKeyDown={this.keyDownHandler}>
                        <div className="header">
                            <span className="title">{this.props.title}</span>
                            <span className="close" onClick={this.closeModelHandler}>
                                <span className="close-text">esc to close</span> | <i className={this.iconClasses.close} />
                            </span>
                        </div>
                        <div className="body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
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
