define(function(require) {
    var Utils = require('drc/utils/Utils');

    describe('Utils', function() {
        describe('guid function', function() {
            it('should generate a unique identifier', function() {
                var id1 = Utils.guid();
                var id2 = Utils.guid();
                expect(id1).not.toEqual(id2);
                expect(id1).toEqual(jasmine.any(String));
            });
        });
    });
});
