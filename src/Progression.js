var JClass = require('jclass');

var EventDispatcher = JClass.extend(require('events').EventEmitter.prototype),
  HashArray = require('hasharray');

var Progression = EventDispatcher.extend({
  init: function () {
    this.reset();
  },
  reset: function () {
    this._tasks = new HashArray(['id', 'group']);
    this.lastProgress = 0;

    this.update();
  },
  getTasks: function () {
    return this._tasks;
  },
  getTask: function (id) {
    return this._tasks.get(id);
  },
  getChildrenFor: function (id) {
    return this._tasks.getAsArray('$' + id);
  },
  getProgress: function () {
    if (this._tasks.all.length == 0)
      return 0.0;
      
    var total = this._tasks.sum('*', 'count', 'weight'),
      actual = this._tasks.filter('*', 'completed').sum('*', 'count', 'weight');

    // Should be a value between 0 and 1
    return actual / total;
  },
  addTask: function (task, groupId) {
    var self = this;
    
    task = typeof(task) == 'string' ? {id: task} : task;

    if (this._tasks.has(task.id))
      throw Error('Cannot add the same task twice '. task);

    task.count = task.count || 1;
    task.weight = task.weight || 1;
    task.countCompleted = task.countCompleted || 0;
    task.completed = task.countCompleted || false;
    task.group = '$' + groupId;
  
    task.isParent = function () {
      return self.getChildrenFor(this.id).length != 0;
    }

    this._tasks.add(task);

    this.emit('progress', this.getProgress());
  },
  update: function () {
    if (this.getProgress() != this.lastProgress)
    {
      this.emit('progress', this.getProgress());

      if (this.getProgress() == 1.0)
        this.emit('finished');
    }
  },
  progress: function (id) {
    var task = this._tasks.get(id);

    // Verify children tasks are completed.
    var children = this._tasks.getAsArray('$' + id);
    if (children.length)
    {
      var childrenCompleted = true;
      children.forEach(function (child) {
        childrenCompleted = childrenCompleted && child.completed;
      });

      if (!childrenCompleted)
        throw Error('Cannot complete parent task until children in its group are completed');
    }

    task.countCompleted += Math.min(task.count - task.countCompleted, 1);
    task.completed = task.countCompleted == task.count;

    this.emit('progress', this.getProgress());

    if (this.getProgress() > 1.0)
      throw Error('Something bad happened, progress is greater than 1.0 and this should never happen ' +this.getProgress());

    // Needed for the update() function.
    this.lastProgress == this.getProgress();

    if (task.completed)
      this.emit('completed', task);

    if (this.getProgress() == 1.0)
      this.emit('finished');
  }
});

module.exports = Progression;