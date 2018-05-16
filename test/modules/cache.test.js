let expect = require('chai').expect;
let Cache = require('../../src/modules/cache').Cache;
let CacheItem = require('../../src/modules/cache').CacheItem;

describe('add()', () => {
    it('should add objects to the cache', () => {
        // PREPARE
        let c = new Cache(600);

        // SYSTEM UNDER TEST
        c.add("1", { some: "prop1"})
        c.add("2", { some: "prop2"})
        c.add("3", { some: "prop3"})

        // VERIFY
        expect(c.count()).to.be.equal(3);
    })

    it('should throw an error if the object is null', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c.add("1", null);
        } catch (error) {
            errorMessage = error.message;
        }
       
        // VERIFY
        expect(errorMessage).to.be.equal("Can't add 'null' to cache");
    })

    it('should throw an error if the object is undefined', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c.add("1", undefined);
        } catch (error) {
            errorMessage = error.message;
        }
       
        // VERIFY
        expect(errorMessage).to.be.equal("Can't add 'undefined' to cache");
    })

    it('should throw an error if the key is null', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c.add(null, { some: "prop" });
        } catch (error) {
            errorMessage = error.message;
        }

        // VERIFY
        expect(errorMessage).to.be.equal("Can't add object under key 'null'");
    })

    it('should throw an error if the key is undefined', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c.add(undefined, { some: "prop" });
        } catch (error) {
            errorMessage = error.message;
        }

        // VERIFY
        expect(errorMessage).to.be.equal("Can't add object under key 'undefined'");
    })

    it('should throw an error if there already is an valid object stored under the same key', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        c.add("2", { some: "prop1"})

        // SYSTEM UNDER TEST
        try {
            c.add("2", { some: "prop2"})
        } catch (error) {
            errorMessage = error.message;
        }

        // VERIFY
        expect(errorMessage).to.be.equal(`There already is an object stored under the key '2'`);
    })

    it('should replace invalid objects that exceeded the cache time', () => {
        // PREPARE
        let c = new Cache(600);
        let objToReplace = { some: "prop1" }
        let newObj = { someNew: "prop" }

        c.add("1", objToReplace)
        c.add("2", { some: "prop2"})
        c.add("3", { some: "prop3"})

        c._isItemInvalid = function (item) {
            if (item.value === objToReplace) {
                return true;
            }
            return false;
        }

        // SYSTEM UNDER TEST
        c.add("1", newObj);

        // VERIFY
        expect(c.count()).to.be.equal(3);
        expect(c.retrieve("1")).to.be.equal(newObj);
    })
})

describe('retrieve', () => {
    // TODO
})

describe('count()', () => {

    it('should return 0 if empty', () => {
        // PREPARE
        let c = new Cache(600);

        // SYSTEM UNDER TEST
        let count = c.count();

        // VERIFY
        expect(count).to.be.equal(0);
    });

    it('should return the amount of items in the cache', () => {
        // PREPARE
        let c = new Cache(600);

        c.add("1", { some: "item" })
        c.add("2", { some: "item" })
        c.add("3", { some: "item" })

        // SYSTEM UNDER TEST
        let count = c.count();

        // VERIFY
        expect(count).to.be.equal(3);
    })
})

describe('tidy()', () => {
    it('should remove invalid items from cache', () => {
        // PREPARE
        let c = new Cache(600);

        let obj1 = { some: "prop1" }
        let obj2 = { some: "prop2" }
        let obj3 = { some: "prop3" }
        let obj4 = { some: "prop4" }

        c._isItemInvalid = function (item) {
            if (item.value === obj1 || item.value === obj4) {
                return true;
            }
            return false;
        }

        c.add("1", obj1)
        c.add("2", obj2)
        c.add("3", obj3)
        c.add("4", obj4)

        // SYSTEM UNDER TEST
        c.tidy();

        // VERIFY
        expect(c.count()).to.be.equal(2);
    });

    it('should keep valid items in cache untouched', () => {
        // PREPARE
        let c = new Cache(600);

        let obj1 = { some: "prop1" }
        let obj2 = { some: "prop2" }
        let obj3 = { some: "prop3" }
        let obj4 = { some: "prop4" }

        c.add("1", obj1)
        c.add("2", obj2)
        c.add("3", obj3)
        c.add("4", obj4)

        // SYSTEM UNDER TEST
        c.tidy();

        // VERIFY
        expect(c.count()).to.be.equal(4);
        expect(c.retrieve("1")).to.be.equal(obj1)
        expect(c.retrieve("2")).to.be.equal(obj2)
        expect(c.retrieve("3")).to.be.equal(obj3)
        expect(c.retrieve("4")).to.be.equal(obj4)
    });

    it('should work if cache is empty', () => {
        // PREPARE
        let c = new Cache(600);

        // SYSTEM UNDER TEST
        c.tidy();

        // VERIFY
        // no error 
    })
})

describe('_isItemInvalid()', () => {

    it('should throw an error if null was passed', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c._isItemInvalid(null)
        } catch (error) {
            errorMessage = error.message
        }
        
        // VERIFY
        expect(errorMessage).to.be.equal("Invalid parameter 'null'");
    })

    it('should throw an error if undefined was passed', () => {
        // PREPARE
        let c = new Cache(600);
        let errorMessage = '';

        // SYSTEM UNDER TEST
        try {
            c._isItemInvalid(undefined)
        } catch (error) {
            errorMessage = error.message
        }

        // VERIFY
        expect(errorMessage).to.be.equal("Invalid parameter 'undefined'");
    })
})