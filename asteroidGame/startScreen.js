function StartScreen(_addScreenHandler, _popScreenHandler){
	var self = this;
	self.constructorBase = Screen;
	self.constructorBase(_addScreenHandler, _popScreenHandler);

	var events = [];
	events.push(new IdleEvent());

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0,0, canvasWidth,canvasHeight);

	/*Set blend func*/
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.useProgram(shaderProgram);
	gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);


	var keys = {
		"space" : 	{"keypress" : function(){_addScreenHandler(1)}},
		"enter" : 	{"keypress" : function(){_addScreenHandler(1)}}
	}


	self.handleInput = function(){
		if(pressedKeys[32])keys["space"].keypress();
		if(currentlyPressedKeys[13])keys["enter"].keypress();
	}

	self.onresize = function(gl){
		gl.useProgram(shaderProgram);
		gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);
	}


	/*Main loop*/
	self.mainLoop = function(dt, gl){
		//Update
		//Events update
		if(events.length > 0){
			events[0].update(dt);
			if(!events[0].alive){
				events[0].onDeath();
				events.shift(); //Shift actual event
				if(events.length > 0)events[0].start(); //Start new event
			}
		}


		//Draw-----------------------------------
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(shaderProgram);


		//Draw GUI
		gl.enable(gl.BLEND);

		if(events.length > 0)events[0].draw();

		drawTextTexture(50, 350, 18.0,60.0, "ASTEROID BLAST", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});

		gl.disable(gl.BLEND);
	}



	self.onremove = function(){
		
	}


	/*------------------------EVENTS------------------------*/
	function IdleEvent(){
		var self = this;
		
		self.time = 0;

		function start(){
			
		}
		
		function update(_dt){
			self.time += _dt;

		}

		function draw(){
			let alpha = 0.2 + ((Math.sin(self.time * 5.0) + 1.0) / 2.5);
			drawTextTexture(270, 150, 12.0,20.0, "START", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : alpha});
		}

		function onDeath(){
			
		}
		
		start();

		self.constructorBase = Event;
		self.constructorBase(start, update, draw, onDeath);
	}
	IdleEvent.prototype = new Event;

}
StartScreen.prototype = new Screen;