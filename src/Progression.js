/*===========================================================================*\
 * Requires
\*===========================================================================*/
var JClass = require('jclass'),
  debug = require('debug')('progression');

var EventDispatcher = JClass._extend(require('events').EventEmitter.prototype),
  HashArray = require('hasharray');

/*===========================================================================*\
 * TaskNode
\*===========================================================================*/
var TaskNode = JClass._extend({
  //-----------------------------------
  // Properties
  //-----------------------------------
  hasChildren: function () {
    return this._tasks !== undefined;
  },
  isParent: function () {
    return this._tasks !== undefined;
  },
  isCompleted: function () {
    if (!this._tasks)
      return this.completed;

    var completed = true;

    if (this._tasks)
      this._tasks.all.forEach(function (task) {
        completed = completed && task.isCompleted();
      });

    return completed;
  },
  //-----------------------------------
  // Constructor
  //-----------------------------------
  init: function (obj) {
    if (obj.isProgression)
      this.progression = obj;

    obj = obj || {};
    this.id = obj.id;
    this.name = obj.name;
    this.weight = obj.weight || 1.0;
    this._tasks = undefined;
    this.completed = !!obj.completedWhenEmpty;
  },
  //-----------------------------------
  // Methods
  //-----------------------------------
  addTask: function (task) {
    if (!this._tasks)
     this._tasks = new HashArray(['id']);

    this._tasks.add(task);
  },
  getProgress: function () {
    if (this.progression)
      return this.progression.getProgress();

    ///console.log(this.completed, this.isCompleted());
    if (!this.hasChildren())
      return this.isCompleted() ? 1.0 : 0.0;

    var p = 0.0,
      totalWeight = 0.0;

    this._tasks.all.forEach(function (task) {
      totalWeight += task.weight;
    });

    this._tasks.all.forEach(function (task) {
      p += task.getProgress() * task.weight;
    });

    return (p / totalWeight);
  }
});

/*===========================================================================*\
 * Progression
\*===========================================================================*/
var Progression = EventDispatcher._extend({
  //-----------------------------------
  // Properties
  //-----------------------------------
  getUnfinishedTasks: function () {
    var ret = [];

    this._tasks.all.forEach(function (task) {
      (!task.isCompleted()) ? ret.push(task.id) : '';
    });

    return ret;
  },
  getTasks: function () {
    return this._tasks;
  },
  hasTasks: function () {
    return this._tasks.all.length;
  },
  getTask: function (id) {
    return this._tasks.get(id);
  },
  getProgress: function () {
    return this.root.getProgress();
  },
  //-----------------------------------
  // Constructor
  //-----------------------------------
  init: function (id, options) {
    if (typeof id === 'object') {
      options = id;
      id = undefined;
    }

    this.options = options || {};
    this.id = id;
    this.weight = 1.0;
    this.reset();
    this.isProgression = true;
  },
  //-----------------------------------
  // Methods
  //-----------------------------------
  reset: function () {
    this._tasks = new HashArray(['id']);
    this.root = new TaskNode({
      id: 'root',
      weight: 1.0,
      completedWhenEmpty: this.options.completedWhenEmpty
    });
    this._tasks.add(this.root);
    this.lastProgress = 0;

    this.update();
  },
  debug: function () {
    // Show all uncompleted tasks
    var ret = [];

    this._tasks.forEach('*', function (task) {
      if (!task.isCompleted())
      {
        if (task.progression)
          ret = ret.concat(task.progression.debug());
        else
          ret.push(task);
      }
    });

    return ret;
  },
  addTasks: function () {
    for (var key in arguments)
      this.addTask(arguments[key]);
  },
  addTask: function (taskOrProgression, parentId) {
    var task = undefined;

    if (taskOrProgression.isProgression)
    {
      if (this._tasks.has(taskOrProgression.id))
        throw Error('Cannot have the same progression added twice ' + taskOrProgression);

      taskOrProgression.on('progress', this.childProgression_progressHandler.bind(this));

      task = new TaskNode(taskOrProgression);
    }
    else
    {
      var task = typeof(taskOrProgression) == 'string' ? {id: taskOrProgression, weight: 1.0} : taskOrProgression;

      if (this._tasks.has(task.id))
        throw Error('Cannot have the same task added twice ' + taskOrProgression);

      task = new TaskNode(task);
    }

    var parentTask = this._tasks.get(parentId || 'root');

    if (!parentTask)
      throw Error('Could not find parentTask with id ' + parentId + ' on progression ' + this.id);

    parentTask.addTask(task);

    this._tasks.add(task);
    this.update(task);
  },
  update: function (task) {
    if (this.getProgress() != this.lastProgress)
    {
      this.lastProgress = this.getProgress();

      this.emit('progress', this.getProgress(), task);

      if (this.getProgress() == 1.0)
        this.emit('finished', task);
    }
  },
  progress: function (id) {
    if (this._tasks.all.length == 1)
    {
      debug('WARNING: progress() was called with no tasks added.');
      return;
    }

    var task = this._tasks.get(id);

    if (!task)
      throw Error('Task not found: ' + id);

    if (task.hasChildren())
    {
      throw Error('Cannot add progress to a task with children. Complete all children to finish parent level task.');
    }

    task.completed = true;

    if (task.completed)
      this.emit('completed', task);

    this.update(task);
  },
  //-----------------------------------
  // Events
  //-----------------------------------
  childProgression_progressHandler: function (p, task) {
    this.update(task);
  }
});

module.exports = Progression;
