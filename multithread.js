!function() {

	try {
		var URL = window.URL || window.webkitURL;
	} catch(e) {
		throw new Error('This browser does not support Blob URLs');
	}

	if(!window.Worker) {
		throw new Error('This browser does not support Web Workers');
	}

	function Multithread(threads) {
		this.threads = Math.max(2, threads | 0);
		this._queue = [];
		this._activeThreads = 0;
		this._debug = {
			start: 0,
			end: 0,
			time: 0,
		};
	}

	Multithread.prototype._worker = function() {
		/**/name/**/ = (/**/func/**/);
		self.addEventListener('message', function(e) {
			var data = e.data;
			var view = new DataView(data);
			var len = data.byteLength;
			var str = Array(len);
			for(var i=0;i<len;i++) {
				str[i] = String.fromCharCode(view.getUint8(i));
			}
			var args = JSON.parse(str.join(''));
			var value = (/**/name/**/).apply(/**/name/**/, args);
			try {
				data = JSON.stringify(value);
			} catch(e) {
				throw new Error('Parallel function must return JSON serializable response');
			}
			len = typeof(data)==='undefined'?0:data.length;
			var buffer = new ArrayBuffer(len);
			view = new DataView(buffer);
			for(i=0;i<len;i++) {
				view.setUint8(i, data.charCodeAt(i) & 255);
			}
			self.postMessage(buffer, [buffer]);
		});
	};

	Multithread.prototype._encode = function(args) {
		try {
			var data = JSON.stringify(args);
		} catch(e) {
			throw new Error('Arguments provided to parallel function must be JSON serializable');
		}
		len = data.length;
		var buffer = new ArrayBuffer(len);
		var view = new DataView(buffer);
		for(var i=0;i<len;i++) {
			view.setUint8(i, data.charCodeAt(i) & 255);
		}
		return buffer;
	};

	Multithread.prototype._decode = function(data) {
		var view = new DataView(data);
		var len = data.byteLength;
		var str = Array(len);
		for(var i=0;i<len;i++) {
			str[i] = String.fromCharCode(view.getUint8(i));
		}
		if(!str.length) {
			return;
		} else {
			return JSON.parse(str.join(''));
		}
	};

	Multithread.prototype._execute = function(script, args, callback) {
		if(!this._activeThreads) {
			this._debug.start = (new Date).valueOf();
		}
		if(this._activeThreads < this.threads) {
			this._activeThreads++;
			var t = (new Date()).valueOf();
			var resource = URL.createObjectURL(new Blob([script], {type: 'text/javascript'}))
			var worker = new Worker(resource);
			var buffer = this._encode(args);
			var decode = this._decode;
			var ready = this.ready.bind(this);
			var self = this;
			var listener = function(e) {
				callback.call(self, decode(e.data), (new Date).valueOf() - t);
				URL.revokeObjectURL(resource);
				this.terminate();
				ready();
			};
			worker.addEventListener('message', listener);
			worker.postMessage(buffer, [buffer]);
		} else {
			this._queue.push([script, args, callback]);
		}
	};

	Multithread.prototype.ready = function() {
		this._activeThreads--;
		if(this._queue.length) {
			this._execute.apply(this, this._queue.shift());
		} else if(!this._activeThreads) {
			this._debug.end = (new Date).valueOf();
			this._debug.time = this._debug.end - this._debug.start;
		}
	};

	Multithread.prototype.process = function(fn, callback) {

		fn = fn;
		var name = fn.name;
		var fnStr = fn.toString();
		if(!name) {
			name = '$' + ((Math.random()*10)|0);
			while (fnStr.indexOf(name) !== -1) {
				name += ((Math.random()*10)|0);
			}
		}

		var script = this._worker
			.toString()
			.replace(/^.*?[\n\r]+/gi, '')
			.replace(/\}[\s]*$/, '')
			.replace(/\/\*\*\/name\/\*\*\//gi, name)
			.replace(/\/\*\*\/func\/\*\*\//gi, fnStr);

		var self = this;

		return function() {
			self._execute(script, [].slice.call(arguments), callback)
		};

	};

	window['Multithread'] = Multithread;

}();