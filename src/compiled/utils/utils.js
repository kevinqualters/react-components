define(function(require) {
    'use strict';

    var Moment = require('moment');

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
     * Get formatted time string given the start and end times
     * @param  {int} start        Start timestamp
     * @param  {int} end          End timestamp
     * @param  {bool} includeDate Whether time should include date
     * @return {String}           Formatted time optionally prepended by date
     */
    function calculateTimeString(start, end, includeDate) {
        var format = 'h:mm A',
            startTime = Moment(start).format(format),
            endTime = Moment(end).format(format);

        var date = includeDate ? Moment(start).format('MMM Do,') : '';

        //If all actions occured at the same minute, just show a single minute, not a range
        if(startTime === endTime){
            return date + " " + startTime;
        }

        return date + " " + startTime + ' - ' + endTime;
    }

    return {
        guid: guid,
        calculateTimeString: calculateTimeString
    };
});
