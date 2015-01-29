define(function(require) {
    'use strict';

    var App = require('examples/App');
    var React = require('react');

    React.render(
        <App />, document.getElementById('app')
    );
});
