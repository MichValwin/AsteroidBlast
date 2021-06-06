function LoadScreen(_addScreenHandler, _popScreenHandler){
	var self = this;
	self.constructorBase = Screen;
	self.constructorBase(_addScreenHandler, _popScreenHandler);

	var events = [];
	events.push(new LoadStartEvent());

	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.viewport(0,0, canvasWidth,canvasHeight);

	/*Set blend func*/
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.useProgram(shaderProgram);
	gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);


	self.handleInput = function(){
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

		

		gl.disable(gl.BLEND);
	}



	self.onremove = function(){
		
	}


	/*AJAX*/
	function getAjax(_url, _callback){
		var ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let responseJSON = JSON.parse(this.responseText);
				_callback(responseJSON);
			}
		};
		ajax.open("GET", _url, true);
		ajax.send();
	}

	function postAjax(_jsonData, _url, _callback){
		var ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let responseJSON = JSON.parse(this.responseText);
				_callback(responseJSON);
			}
		};
		ajax.open("POST", _url, true);
		ajax.setRequestHeader("Content-type", "application/json");
		ajax.send(JSON.stringify(_jsonData));
	}



	/*------------------------EVENTS------------------------*/
	function LoadStartEvent(){
		var self = this;
		
		function start(){
			getAjax("/logged", callbackUsernameAjax);
		}
		
		function update(_dt){

		}

		function draw(){
			drawTextTexture(250, 200, 16.0,16.0, "LOADING", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
		}

		function onDeath(){
			
		}

		function callbackUsernameAjax(_responseJSON){
			console.log(_responseJSON);
			if(_responseJSON.res == "OK"){
				username = _responseJSON.username;
				getAjax(FASES, callbackFasesAjax);
			}else{
				self.alive = false;
				events.push(new ErrorEvent(4));
			}
		}

		function callbackFasesAjax(_responseJSON){
			console.log(_responseJSON);
			if(_responseJSON.res == "OK"){
				fases = _responseJSON.fases;
				postAjax({"req" : "getLogro"}, REST, callbackLogrosAjax);
			}else{
				self.alive = false;
				events.push(new ErrorEvent(4));
			}
		}

		function callbackLogrosAjax(_responseJSON){
			console.log(_responseJSON);
			if(_responseJSON.res == "OK"){
				logros = _responseJSON.logros;
				console.log(username);
				postAjax({"req" : "getLogroUser", "username" : username}, REST, callbackLogrosUserAjax);
			}else{
				self.alive = false;
				events.push(new ErrorEvent(4));
			}
		}

		function callbackLogrosUserAjax(_responseJSON){
			console.log(_responseJSON);
			if(_responseJSON.res == "OK"){
				logrosUser = _responseJSON.logros;
				self.alive = false;
				_addScreenHandler(0);
			}else{
				self.alive = false;
				events.push(new ErrorEvent(4));
			}
		}
		
		start();

		self.constructorBase = Event;
		self.constructorBase(start, update, draw, onDeath);
	}
	LoadStartEvent.prototype = new Event;


	function ErrorEvent(_time){
		var self = this;
		
		function start(){

		}
		
		function draw(){
			drawTextTexture(180, 400, 32.0, 32.0, "ERROR", {"r" : 1.0, "g" : 0.2, "b" : 0.2, "a" : 1.0});
			drawTextTexture(110, 300, 32.0, 32.0, "LOADING", {"r" : 1.0, "g" : 0.2, "b" : 0.2, "a" : 1.0});

			drawTextTexture(150, 150, 25.0, 25.0, "NO USER", {"r" : 1.0, "g" : 0.2, "b" : 0.2, "a" : 1.0});
			drawTextTexture(200, 80, 25.0, 25.0, "LOGGED", {"r" : 1.0, "g" : 0.2, "b" : 0.2, "a" : 1.0});
		}

		function onDeath(){
			//Redirect to login page
			window.location = "/";
		}
		
		self.constructorBase = TimedEvent;
		self.constructorBase(_time, start, function(){}, draw, onDeath);
	}
	ErrorEvent.prototype = new TimedEvent;

}
LoadScreen.prototype = new Screen;