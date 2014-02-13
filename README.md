Multithread
===========

In-browser multithreading made easy

Multithread is a simple wrapper that eliminates the hassle of dealing with Web Workers and
transferrable objects.

Run any code you'd like asynchronously, in its own thread, without interrupting the user experience.


Using Multithread
-----------------

Using Multithread is simple. Include multithread.js on any page you'd like using
```html
<script src="my/path/to/multithread.js"></script>
```

And instantiate it in any script tag using
```js
var num_threads = 2;
var MT = new Multithread(num_threads);
```

Multithread will provide the best results when ```num_threads``` matches the processor core count of the computer
you're using, but 2-4 threads should always be reasonably speedy.


Running a Thread Asynchronously
-------------------------------

The fun stuff! Run any code you want (in the form of a function) asynchronously, in a separate thread like so:
```js
MT.process(function, callback)(arg1, arg2, ..., argN);
```

Where ```function``` is of the form:
```js
function(arg1, arg2, ... argN) {
  /* function body */
}
```

and ```callback``` is of the form:
```js
function(returnValue) {
  /* do something with returnValue in main thread */
}
```

Note that ```.process()``` itself will return a function object that will not execute until explicitly
told to do so.
```js
var funcInADifferentThread = MT.process(
  function(a, b) { return a + b; },
  function(r) { console.log(r) }
);

// Nothing has happened,
//funcInADifferentThread has not executed yet...

funcInADifferentThread(1, 2);
console.log('Before or after?');

// We now see "Before or after?" logged in the console,
// and "3" (= 1 + 2) logged shortly thereafter...
// it was running asynchronously
```

That's it! ... Almost.


Scope Warning
-------------

Keep in mind that any threaded function is **completely scope unaware**, meaning something like:
```js
function scopeCheck() {
  var scopeVar = 2;
  MT.process(
    function() { return scopeVar + 2; },
    function(r) { console.log('Cool'); }
  )();
}
scopeCheck();
```
Will throw ```ReferenceError: scopeVar is not defined```

However, **callbacks are scope aware** so you needn't be as careful with them.


Recursion
---------

You can accomplish recursion simply by naming your functions as you pass them to Multithread
```js
MT.process(
  function Recurse(m, n) {
    if(n>0) {
      return Recurse(m + 1, n--);
    } else {
      return m;
    }
  },
  function(r) {
    console.log(r);
  }
)(5, 2);

// This will increase m twice recursively and log "7"
```


Other Warnings
--------------

Be aware of the limitations of multithreading in JavaScript.

All variables passed to functions must be JSON-serializable, meaning only Arrays, Objects, and base types (Number, String, Boolean, null). Same with return variables. No custom objects or prototypes.

Objects and Arrays, as passed to any threaded function, will be deep-copied (passed by value, not reference).


Thank You
---------

Thanks, and have fun! :)

Feedback is always appreciated. (Stars, forks, criticisms, you name it!)

You can follow me on twitter at http://twitter.com/keithwhor or visit my website at http://keithwhor.com/

