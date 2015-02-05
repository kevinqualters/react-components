define(function(require) {
    'use strict';

    var _ = require('lodash');
    var Moment = require('moment');
    var React = require('react');

    var guid = (function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return function() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })();

    /**
     * Get formatted time string given the start and end times.
     * @param  {Int} start - Start timestamp
     * @param  {Int} end - End timestamp
     * @param  {Bool} includeDate - Whether time should include date
     * @return {String} - Formatted time optionally prepended by date
     */
    function calculateTimeString(start, end, includeDate) {
        var format = 'h:mm A',
            startTime = Moment(start).format(format),
            endTime = Moment(end).format(format);

        var date = includeDate ? Moment(start).format('MMM Do,') : '';

        // If all actions occurred at the same minute, just show a single minute, not a range.
        if(startTime === endTime){
            return date + " " + startTime;
        }

        return date + " " + startTime + ' - ' + endTime;
    }

    /**
     * Retrieves the loader classes for a component.
     * @param {Bool} loading - The loading state of a component.
     * @param {Array|String} iconClasses - The classes to add to the loader when loading.
     * @returns {Object} React.addons.classSet
     */
    function getLoaderClasses(loading, iconClasses) {
        if (typeof iconClasses === 'string') {
            if (iconClasses.indexOf(' ') !== -1) {
                iconClasses = iconClasses.split(' ');
            }
            else {
                iconClasses = [iconClasses];
            }
        }
        if (!iconClasses || !_.isArray(iconClasses || _.isEmpty(iconClasses))) {
            iconClasses = ['icon', 'ion-loading-c'];
        }
        var classes = {
            'loader': true,
            'hide': !loading
        };

        _.forEach(iconClasses, function(iconClass) {
            classes[iconClass] = loading;
        });

        return React.addons.classSet(classes);
    }

    return {
        guid: guid,
        getLoaderClasses: getLoaderClasses,
        calculateTimeString: calculateTimeString
    };
});
