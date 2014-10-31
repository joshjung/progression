var assert = require('assert'),
	Progression = require('../src/Progression');

describe('Progression', function() {
	describe('new Progression() should work', function() {
		var p = new Progression();

    it('should have a progression task array', function() {
      assert.equal(p.getTasks().all.length, 0);
    });
	});

	describe('addTask(...) should work', function() {
		var p = new Progression();

    p.addTask('task1');

    it('should have a progression task array', function() {
      assert.equal(p.getTasks().all.length, 1);
    });
	});
});