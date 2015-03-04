define(function() {
    'use strict';

    return {
        /**
         * Capitalise the first letter of a string.
         * @param {String} string
         * @returns {String}
         */
        capitaliseFirstLetter: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    };
});
