define(function(require) {
    var SearchStore = require('SearchStore');
    var RequestHandler = require('RequestHandler');

    describe('SearchStore', function() {

        describe('getData function', function() {
            it('toggles between enabled and disabled', function() {
                expect(SearchStore.getData()).toEqual([]);

                SearchStore.itemData = "test data";

                expect(SearchStore.getData()).toEqual('test data');

                SearchStore.itemData = [];
            });
        });

        describe('dispatchRegister function', function(){
            it('bails when shouldHandleAction returns false', function(){
                spyOn(RequestHandler, 'request');
                spyOn(SearchStore, 'shouldHandleAction').and.returnValue(false);

                SearchStore.dispatchRegister({action: {component: 'foo', data: {url: '/test/url'}}});

                expect(RequestHandler.request.calls.count()).toEqual(0);
                expect(SearchStore.shouldHandleAction).toHaveBeenCalledWith('foo');
            });

            it('calls request and passes in callback method', function(){
                spyOn(RequestHandler, 'request');
                spyOn(SearchStore, 'shouldHandleAction').and.returnValue(true);

                SearchStore.dispatchRegister({action: {component: 'foo', data: {url: '/test/url'}}});

                expect(SearchStore.shouldHandleAction).toHaveBeenCalledWith('foo');

                expect(RequestHandler.request).toHaveBeenCalled();

                var requestArgs = RequestHandler.request.calls.allArgs()[0];
                expect(requestArgs[0]).toEqual('/test/url');
                expect(requestArgs[1]).toBeNull();

                var successFunction = requestArgs[2];
                var failFunction = requestArgs[3];
                expect(successFunction).toBeFunction();
                expect(failFunction).toBeFunction();

                spyOn(SearchStore, 'emitChange');
                spyOn(SearchStore, 'emitFail');

                successFunction('foo');
                expect(SearchStore.emitChange).toHaveBeenCalledWith();
                expect(SearchStore.itemData).toEqual('foo');
                expect(SearchStore.emitFail.calls.count()).toEqual(0);

                SearchStore.emitChange.calls.reset();

                failFunction('foo');
                expect(SearchStore.emitFail).toHaveBeenCalledWith();
                expect(SearchStore.emitChange.calls.count()).toEqual(0);
            });
        });
    });
});
