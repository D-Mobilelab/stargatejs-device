var foo = require('../foo');

describe('foo', function(){
    it('Expect foo works', function(){
        var value = foo('bar');
        expect(value).toEqual('foo bar');
    })
})