define(function(require) {
    var StringUtils = require('drc/utils/StringUtils');

    describe('StringUtils', function() {
        describe('capitaliseFirstLetter function', function() {
            it('should capitalise the first character of a string', function() {
                var str = 'test';
                str = StringUtils.capitaliseFirstLetter(str);
                expect(str).toEqual('Test');
            });
        });
    });
});
