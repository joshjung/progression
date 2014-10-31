var JClass = require('jclass');

var EventDispatcher = JClass.extend(require('events').EventEmitter.prototype),
  HashArray = require('hasharray');

var Progression = EventDispatcher.extend({
  init: function () {
    this._tasks = new HashArray(['id']);
  },
  getTasks: function () {
    return this._tasks;
  },
  getProgress: function () {
    var total = this._tasks.sum('*', 'count', 'weight'),
      actual = this._tasks.filter('*', 'completed').sum('*', 'count', 'weight');
    
    // Should be a value between 0 and 1
    return actual / total;
  },
  addTask: function (task) {
    task = typeof(task) == 'string' ? {id: task} : task;
    task.count = task.count || 1;
    task.weight = task.weight || 1;
    task.countCompleted = task.countCompleted || 0;
    task.completed = task.countCompleted || false;

    this._tasks.add(task);

    this.emit('progress', this.getProgress());
  },
  completeTask: function (id) {
    var task = this._tasks.get(id);

    task.countCompleted += Math.min(task.count - task.countCompleted, 1);
    task.completed = task.countCompleted == task.count;

    this.emit('progress', this.getProgress());
  }
});

module.exports = Progression;