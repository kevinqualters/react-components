define(function(require) {
    'use strict';

    var App = require('components/App');
    var React = require('react');

    React.renderComponent(
        <App />, document.getElementById('app')
    );
});
