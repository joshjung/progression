var assert = require('assert'),
	Progression = require('../src/Progression');

describe('Progression', function() {
	describe('new Progression() should work', function() {
		var p = new Progression();

    it('should have a progression task array', function() {
      assert.equal(p.getTasks().all.length, 0);
    });
    
    it('should have lastProgress of 0', function() {
      assert.equal(p.lastProgress, 0);
    });
    
    it('should have getProgress() of 0', function() {
      assert.equal(p.getProgress(), 0);
    });
	});

	describe('addTask(...)', function() {
		var p = new Progression();

    p.addTask('task1');

    it('after addTask, should have a progression task array', function() {
      assert.equal(p.getTasks().all.length, 1);
    });

    it('should fail if the same task is added twice', function() {
      assert.throws(function () {p.addTask('task1');}, function (err) {return true;});
    });
	});
  
	describe('getProgress() and progress()', function() {
		var p = new Progression();

    p.addTask('task1');
    p.addTask('task2');
    p.addTask('task3');
    p.addTask('task4');
    p.addTask('task5');
    p.addTask('task6');

    it('should have 0 percentage complete after adding no complete items', function() {
      assert.equal(p.getProgress(), 0);
    });

    it('should have 1/n percentage complete after completing each item', function() {
      for (var i = 1; i <= 6; i++)
      {
        p.progress('task' + i);
        assert.equal(p.getProgress(), i / 6);
      }
    });

    it('should have n/(n+1) percentage complete after completing each item AND adding another', function() {
      p.addTask('taskFinal')
      assert.equal(p.getProgress(), 6/7);
    });
	});

  describe('\'progress\' event', function() {
		var p = new Progression();

    p.addTask('main');
    
    var dispatched = false;
    
    p.on('progress', function () {
      dispatched = true;
    });

    it('should be dispatched whenever progress() is called', function() {
      p.progress('main');
      assert.equal(dispatched, true);
    });
  });
  
  describe('\'completed\' event', function() {
		var p = new Progression();

    p.addTask('main');
    
    var dispatched = false;
    
    p.on('completed', function () {
      dispatched = true;
    });

    it('should be dispatched whenever progress() is called on a task that has been completed', function() {
      p.progress('main');
      assert.equal(dispatched, true);
    });
  });
  
  describe('\'finished\' event', function() {
		var p = new Progression();

    p.addTask('main');
    p.addTask('main2');
    
    var dispatched = false;
    
    p.on('finished', function () {
      dispatched = true;
    });

    it('should ONLY be dispatched whenever that last task is completed and getProgress() is 1.0', function() {
      p.progress('main');
      assert.equal(dispatched, false);
      p.progress('main2');
      assert.equal(dispatched, true);
      assert.equal(p.getProgress(), 1.0);
    });
  });

	describe('getProgress() and progress() with weighted tasks and no counts', function() {
		var p = new Progression();

    p.addTask('main1');
    p.addTask({id: 'sub11', weight: 0.1}, 'main1');
    p.addTask({id: 'sub12', weight: 0.1}, 'main1');
    p.addTask({id: 'sub13', weight: 0.1}, 'main1');

    p.addTask('main2');
    p.addTask({id: 'sub21', weight: 0.1}, 'main2');
    p.addTask({id: 'sub22', weight: 0.1}, 'main2');
    p.addTask({id: 'sub23', weight: 0.1}, 'main2');
    
    p.addTask('main3');
    p.addTask({id: 'sub31', weight: 0.2}, 'main3');
    p.addTask({id: 'sub32', weight: 0.2}, 'main3');
    p.addTask({id: 'sub33', weight: 0.2}, 'main3');

    var weightTotal = (3 * 1) + (0.1 * 3) + (0.1 * 3) + (0.2 * 3);

    it('should have 0 percentage complete after adding no complete items', function() {
      assert.equal(p.getProgress(), 0);
    });

    it('should error if you try to complete a parent task before children finish', function() {
      assert.equal(p.getProgress(), 0);
    });

    it('should have appropriate weighted percentage complete after completing each item', function() {
      var all = p.getTasks().all,
        curWeightCompleted = 0;

      // Complete all subtasks
      all.forEach(function (task) {
        if (!task.isParent())
        {
          p.progress(task.id);
          
          assert.equal(task.countCompleted, 1, 'task.completedCount should be 1!');
          assert.equal(task.completed, true,'task.completed should be true!');
          
          curWeightCompleted += task.weight;
          assert.equal(Math.round(p.getProgress() * 100), Math.round((curWeightCompleted / weightTotal) * 100));
        }
      });

      // Complete parent tasks
      all.forEach(function (task) {
        if (task.isParent())
        {
          p.progress(task.id);
          
          assert.equal(task.countCompleted, 1, 'task.completedCount should be 1!');
          assert.equal(task.completed, true,'task.completed should be true!');
          
          curWeightCompleted += task.weight;
          assert.equal(Math.round(p.getProgress() * 100), Math.round((curWeightCompleted / weightTotal) * 100));
        }
      });
    });
	});
});