define(function(require) {
    'use strict';

    var React = require('react');

    var App = React.createClass({displayName: 'App',
        render: function() {
            return React.createElement("div", {className: "app-component"}, React.createElement("h1", null, "Dataminr React Components"));
        }
    });

    return App;
});
