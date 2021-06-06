function Event(_start, _update, _draw, _onDeath){
	var self = this;
	self.alive = true;
	
	self.start = _start;
	self.update = _update;
	self.draw = _draw;
	self.onDeath = _onDeath;
	self.onchangeEvent = function(){};
}

function ParallelTimedEvent(_maxTime, _start, _update, _draw, _onDeath){
	var self = this;
	self.alive = true;
	self.maxTime = _maxTime;
	self.time = 0;

	self.start = _start;
	self.draw = _draw;
	self.onDeath = _onDeath;
	self.onchangeEvent = function(){};

	self.update = function(_dt){
		self.time += _dt;
		if(self.time > self.maxTime){
			self.alive = false;
		}else{
			_update();
		}
	};
}

function ParallelEvent(_start, _update, _draw, _onDeath){
	var self = this;
	self.alive = true;

	self.start = _start;
	self.update = _update;
	self.draw = _draw;
	self.onDeath = _onDeath;
	self.onchangeEvent = function(){};
}


function TimedEvent(_maxTime, _start, _update, _draw, _onDeath){
	var self = this;
	self.constructorBase = Event;
	self.constructorBase(_start, _update, _draw, _onDeath);
	
	self.maxTime = _maxTime;
	self.time = 0;
	
	self.update = function(_dt){
		self.time += _dt;
		if(self.time > self.maxTime){
			self.alive = false;
		}else{
			_update();
		}
	};
}
TimedEvent.prototype = new Event;