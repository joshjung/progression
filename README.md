![](https://nodei.co/npm/progression.png?downloads=True&stars=True)

Progression
===========

Progression reports a `0.0` - `1.0` progress of a tree of tasks where each task can have an arbitrarily assigned weight (default weight is 1.0 per task).

Within the tree of tasks, tasks can either be in progress or completed.

Tasks can be a simple object with an `id` and `weight` or another Progression object, allowing you to build complex trees of asynchronous tasks and keep
track of how "done" the entire process is.

Examples
========

Simple Use Case
---------------

    var Progression = require('progression');
    var progress = new Progression();
    
    // Add task with a weight of 1.0
    progress.addTask('main');
    
    // Add a subtask of 'main' with a weight of 0.1 and an id of 'sub'
    progress.addTask({id: 'sub', weight: 0.1}, 'main');
    
    // Note: total weight now is 1.1 for all tasks.

    
    const onProgress = function () {
      console.log('Progress: ' + (progress.getProgress() * 100) + '%');
    };
    const onCompleted = function (task) {
      console.log('The task: ' + task.id + ' has been completed');
    };
    const onFinished = function () {
      console.log('All tasks have been completed!');
    };
    
    // Add event listeners to watch what is happening.
    progress.on('progress', onProgress);
    progress.on('completed', onCompleted);
    progress.on('finished', onFinished);

    progress.progress('sub'); // This will trigger a 'progress' event and a 'completed' event for the subtask.
    progress.progress('main'); // Complete the final task and dispatch all three events: 'progress', 'completed', and 'finished'

    // Cleanup
    progress.removeListener('progress', onProgress);
    progress.removeListener('completed', onCompleted);
    progress.removeListener('finished', onFinished);

Options
---------

    var progress = new Progression(options);
    
* `options.completedWhenEmpty`: when true, if the progression has no tasks `getProgress()` will return `1.0`. Default is `false`.

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
=========

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
