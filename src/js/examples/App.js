define(function(require) {
    'use strict';

    var React = require('react');

    var App = React.createClass({
        render: function() {
            return <div className="app-component"><h1>Dataminr React Components</h1></div>;
        }
    });

    return App;
});
