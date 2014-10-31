var JClass = require('jclass');

var EventDispatcher = JClass.extend(require('events').EventEmitter.prototype),
  HashArray = require('hasharray');

var Progression = EventDispatcher.extend({
  init: function () {
    this._super();

    this.__tasks = new HashArray(['id']);
  },
  getTasks: function () {
    return this.__tasks;
  },
  getProgress: function () {
    var total = this.__tasks.sum('*', 'count', 'weight'),
      actual = this.__tasks.filter('*', 'completed').sum('*', 'count', 'weight');
    
    // Should be a value between 0 and 1
    return actual / total;
  },
  addTask: function (task) {
    if (!task.hasOwnProperty('id'))
      throw Error('All __tasks must have \'id\' property');

    if (!task.hasOwnProperty('count'))
      throw Error('All __tasks must have \'count\' property');

    if (!task.hasOwnProperty('weight'))
      throw Error('All __tasks must have \'weight\' property');

    task.countCompleted = task.countCompleted || 0;
    task.completed = task.countCompleted || false;

    this.__tasks.add(task);

    emit('progress', this.getProgress());
  },
  completeTask: function (id) {
    var task = this.__tasks.get(id);

    task.countCompleted += Math.min(task.count - task.countCompleted, 1);
    task.completed = task.countCompleted == task.count;

    emit('progress', this.getProgress());
  }
});

module.exports = Progression;