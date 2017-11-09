var main = require("../main");

describe("Stargate main", function() {
    
    it("device module exists", function() {
        expect(main.device).toBeDefined();
    });
    
    it("iaplight module exists", function() {
        expect(main.iaplight).toBeDefined();
    });
    
    it("share module exists", function() {
        expect(main.share).toBeDefined();
    });
    
    it("statusbar module exists", function() {
        expect(main.statusbar).toBeDefined();
    });
    
    it("app module exists", function() {
        expect(main.app).toBeDefined();
	});

});