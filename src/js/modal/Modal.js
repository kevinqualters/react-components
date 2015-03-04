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
                <div onClick={this.backgroundClickHandler} id="modal-container" data-clickcatcher="true">
                    <div ref="content" className="content" tabIndex="-1" onKeyDown={this.keyDownHandler}>
                        <div className="header">
                            <span className="title">{this.props.title}</span>
                            <span className="close" onClick={this.closeModelHandler}>
                                <span className="close-text">esc to close</span> | <i className="icon ion-close-round" /></span>
                        </div>
                        <div className="body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
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
