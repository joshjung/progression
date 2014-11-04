![](https://nodei.co/npm/progression.png?downloads=True&stars=True)

Progression
===========

Progression reports a `0.0` - `1.0` progress of a tree of tasks where each task can have an arbitrarily assigned weight (default weight is 1.0 per task).

Tasks can be a simple object or another Progression object.

Examples
========

Simple Use Case
---------------

    var Progression = require('progression');

    var progress = new Progression();
    
    // Add task with a weight of 1.0
    progress.addTask('main');
    
    // Add a subtask of 'main' with a weight of 0.1
    progress.addTask({id: 'sub', weight: 0.1}, 'main');
    
    // Note: total weight now is 1.1 for all tasks.

    progress.on('progress', function () {
      console.log('Progress: ' + (progress.getProgres() * 100) + '%');
    });
    
    progress.on('completed', function (task) {
      console.log('The task: ' + task.id + ' has been completed');
    });
    
    progress.on('finished', function (task) {
      console.log('All tasks have been completed!');
    });
    
    progress.progress('sub'); // This will trigger a 'progress' event and a 'completed' event for the subtask.
    
    progress.progress('main'); // Complete the final task and dispatch all three events: 'progress', 'completed', and 'finished'

Resetting
---------

If you want to clear out all tasks and start over:

    progress.reset();

Task Trees
----------

Because each Progression instance can add other Progression instances as children, you can create trees of tasks/progression instances. The base Progression will accurately report the overall progress of all its descendents.

    var Progression = require('progression');

    var parentProgression = new Progression('parent');
    var childProgression = new Progression('someChildName');
    childProgression.addTask('task1');
    
    parentProgression.addTask(childProgress);
    
    ...
    
    childProgress.progress('task1');
    
    console.log(parentProgression.getProgress() == 1.0); // true

Extending
---------

Progression uses [jclass](https://www.npmjs.org/package/jclass), which is an implementation of [John Resig's simple inheritance model](http://ejohn.org/blog/simple-javascript-inheritance/).

You can easily extend Progression:

    var MyCustomProgression = Progression._extend({
      ...
      init: function (id) 
      {
        console.log('My custom progression!');
        this._super(id);
      }
      ...
    });
    
    var myCustomProgression = new MyCustomProgression();

See the `jclass` documentation for more information.

Extending
=========

License
=======

The MIT License (MIT)

Copyright (c) 2014 Joshua Jung

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
    