function GameScreen(_addScreenHandler, _popScreenHandler){
	var self = this;
	self.constructorBase = Screen;
	self.constructorBase(_addScreenHandler, _popScreenHandler);

	/*------------------------Game Variables--------------------------------------*/
	var fase = 0;
	var points = 0;
	var deaths = 0;
	var dificultadGlobal = 0
	var asteroidsDestroyed = 0;
	var ship = new Ship(0,0,20,40);
	var vidas = 4;
	var arrayBullets = new Array(20);
	var asteroids = [];

	var timePlaying = 0.0;

	var events = [];
	var parallelEvents = [];
	var pilaLogros = [];

	//Logros no cumplidos
	var logrosPoints = [];
	var logrosAsteroids = [];
	var logrosFase = [];
	var logrosDeath = [];

	var logrosSubir = [];

	function isIdLogro(_id){
		for(let i = 0; i < logrosUser.length; i++){
			if(logrosUser[i].id == _id)return true;
		}
		return false;
	}

	//Hardcoded logros
	logrosRestantes = [
		{tipo: 'DEATHS', objetivo: '1', titulo: 'La muerte solo es el principio', descripcion: 'Muere una vez'},
		{tipo: 'FASE', objetivo: '1', titulo: 'Fase superada!', descripcion: 'Completa la primera fase'},
		{tipo: 'POINTS', objetivo: '2000', titulo: 'Aprendiz', descripcion: 'Obten mas de 2000 puntos'},
		{tipo: 'POINTS', objetivo: '4000', titulo: 'Principiante', descripcion: 'Obten mas de 4000 puntos'},
		{tipo: 'POINTS', objetivo: '6000', titulo: 'Veterano', descripcion: 'Obten mas de 6000 puntos'},
		{tipo: 'POINTS', objetivo: '10000', titulo: 'Maestro', descripcion: 'Obten mas de 10000 puntos'},
		{tipo: 'POINTS', objetivo: '50000', titulo: 'Gran Maestro', descripcion: 'Obten mas de 50000 puntos'},
		{tipo: 'POINTS', objetivo: '100000', titulo: 'Game killer', descripcion: 'Obten mas de 100000 puntos'},
		{tipo: 'ASTEROIDS', objetivo: '20', titulo: 'Duster', descripcion: 'Destruye 20 asteroides'},
		{tipo: 'ASTEROIDS', objetivo: '40', titulo: 'Cleaner', descripcion: 'Destruye 40 asteroides'},
		{tipo: 'ASTEROIDS', objetivo: '60', titulo: 'Eraser', descripcion: 'Destruye 60 asteroides'},
		{tipo: 'ASTEROIDS', objetivo: '100', titulo: 'The matador', descripcion: 'Destruye 100 asteroides'},
		{tipo: 'ASTEROIDS', objetivo: '400', titulo: 'Asteroid killer', descripcion: 'Destruye 400 asteroides'}
	];

	fases = [
		{id: 1, dificultad: 1, asteroids: 3, ovnis: 0, levelsize: 1000},
		{id: 2, dificultad: 1, asteroids: 8, ovnis: 0, levelsize: 1000},
		{id: 3, dificultad: 1, asteroids: 15, ovnis: 0, levelsize: 1200},
		{id: 4, dificultad: 2, asteroids: 25, ovnis: 0, levelsize: 1500},
		{id: 5, dificultad: 2, asteroids: 30, ovnis: 0, levelsize: 1900}
	]


	//Logros restantes
	/*
	var logrosRestantes = [];
	for(let i = 0; i < logros.length; i++){
		if(!isIdLogro(logros[i].id))logrosRestantes.push(logros[i]);
	}
	*/

	for(let i = 0; i < logrosRestantes.length; i++){
		switch(logrosRestantes[i].tipo){
			case "DEATHS" :
				logrosDeath.push(logrosRestantes[i]);
			break;
			case "FASE" : 
				logrosFase.push(logrosRestantes[i]);
			break;
			case "POINTS" :
				logrosPoints.push(logrosRestantes[i]);
			break;
			case "ASTEROIDS" :
				logrosAsteroids.push(logrosRestantes[i]);
			break;
		}
	}

	function compareObjectivo(a, b){
		return a.objetivo > b.objetivo;
	}

	logrosPoints.sort(compareObjectivo);
	logrosAsteroids.sort(compareObjectivo);
	logrosFase.sort(compareObjectivo);
	logrosDeath.sort(compareObjectivo);

	//Cam position and limits
	var rectangleCamera = new Rectangle(0.0, 0.0, canvasWidth, canvasHeight);
	var camXMoveOffset = 0.2;
	var camYMoveOffset = 0.2;

	var rectangleLevelBounds = new Rectangle(0.0, 0.0, 1000, 1000 / ASPECTRATIO);


	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0,0, canvasWidth,canvasHeight);

	/*Set blend func*/
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.useProgram(shaderProgram);
	gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);

	//Start Game
	events.push(new StartFase(1));
	events[0].start();


	var keys = {
		"a" : 		{"keypress" : function(){ship.rotateAntiButton()}},
		"w" : 		{"keypress" : function(){ship.forwardButton()}},
		"s" : 		{"keypress" : function(){}},
		"d" : 		{"keypress" : function(){ship.rotateButton()}},

		"left" : 	{"keypress" : function(){ship.rotateAntiButton()}},
		"up" : 		{"keypress" : function(){ship.forwardButton()}},
		"right" : 	{"keypress" : function(){ship.rotateButton()}},
		"down" : 	{"keypress" : function(){}},
		"space" : 	{"keypress" : function(){ship.createBulletButton()}}, 
		"enter" : 	{"keypress" : function(){}} 
	}


	self.handleInput = function(){
		if(currentlyPressedKeys[65])keys["a"].keypress();
		if(currentlyPressedKeys[87])keys["w"].keypress();
		if(currentlyPressedKeys[68])keys["d"].keypress();
		if(currentlyPressedKeys[83])keys["s"].keypress();
		if(currentlyPressedKeys[37])keys["left"].keypress();
		if(currentlyPressedKeys[38])keys["up"].keypress();
		if(currentlyPressedKeys[39])keys["right"].keypress();
		if(currentlyPressedKeys[40])keys["down"].keypress();
		if(currentlyPressedKeys[32])keys["space"].keypress();
		if(currentlyPressedKeys[13])keys["enter"].keypress();
	}

	self.onresize = function(gl){
		gl.useProgram(shaderProgram);
		gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);
	}

	/*Main loop*/
	self.mainLoop = function(dt, gl, framebuffer){
		timePlaying += dt;

		//Events update
		if(events.length > 0){
			events[0].update(dt);
			if(!events[0].alive){
				events[0].onDeath();
				events.shift(); //Shift actual event
				if(events.length > 0)events[0].start(); //Start new event
			}
		}

		for(let i = parallelEvents.length - 1; i >= 0; i--){
			parallelEvents[i].update(dt);
			if(!parallelEvents[i].alive){
				parallelEvents[i].onDeath();
				parallelEvents.splice(i, 1);
			}
		}

		//Logros update
		for(let i = 0; i < logrosSubir.length; i++){
			logrosSubir[i].update();
			if(!logrosSubir[i].alive){
				logrosSubir.splice(i, 1);
			}
		}

		//Pila logros update
		if(pilaLogros.length > 0){
			pilaLogros[0].update(dt);
			if(!pilaLogros[0].alive){
				pilaLogros[0].onDeath();
				pilaLogros.shift();
				if(pilaLogros.length > 0)pilaLogros[0].start();
			}
		}

		//Ship update
		ship.update(dt, rectangleLevelBounds, arrayBullets);

		//Camera update
		if(ship.posX > rectangleCamera.posX + rectangleCamera.halfWidth * camXMoveOffset){
			rectangleCamera.posX = ship.posX - rectangleCamera.halfWidth * camXMoveOffset;
		}
		
		if(ship.posY > rectangleCamera.posY + rectangleCamera.halfHeight * camYMoveOffset){
			rectangleCamera.posY = ship.posY - rectangleCamera.halfHeight * camYMoveOffset;
		}
		
		if(ship.posX < rectangleCamera.posX - rectangleCamera.halfWidth * camXMoveOffset){
			rectangleCamera.posX = ship.posX + rectangleCamera.halfWidth * camXMoveOffset;
		}
		
		if(ship.posY < rectangleCamera.posY - rectangleCamera.halfHeight * camYMoveOffset){
			rectangleCamera.posY = ship.posY + rectangleCamera.halfHeight * camYMoveOffset;
		}
		
		
		//Asteroids
		for(let i = 0; i < asteroids.length; i++){
			asteroids[i].update(dt, rectangleLevelBounds);
		}
		
		//Bullets
		for(var i = 0; i < arrayBullets.length; i++){
			if(arrayBullets[i] != undefined){
				//check life
				if(arrayBullets[i].getPosX() > rectangleCamera.posX + rectangleCamera.halfWidth || arrayBullets[i].getPosX() < rectangleCamera.posX - rectangleCamera.halfWidth || 
					arrayBullets[i].getPosY() > rectangleCamera.posY + rectangleCamera.halfHeight || arrayBullets[i].getPosY() < rectangleCamera.posY - rectangleCamera.halfHeight){
					arrayBullets[i] = undefined;
				}else{
					//update
					arrayBullets[i].update(dt);
				}
			}
		}
		
		
		//Draw-----------------------------------
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(shaderProgram);
		
		//Put color
		gl.uniform4f(colorPosition, 1.0,1.0,1.0,1.0);
		
		//Put camera
		var matrixCamera = getTranslationMatrix3X3(-rectangleCamera.posX +rectangleCamera.halfWidth,-rectangleCamera.posY +rectangleCamera.halfHeight); //Do inverse. Inverse of translation matrix is the inverse of the translation
		gl.uniformMatrix3fv(cameraPosition, false, matrixCamera);
		
		//Ship
		gl.uniformMatrix3fv(modelPosition, false, getRotZTranslationMatrix3X3(ship.angle, ship.posX, ship.posY));
		ship.draw();
		
		//Collisions-----------------------------------------------------------------------------------------------------
		//Handle asteroids collisions w/ bullets and ship + draw asteroids
		for(let i = asteroids.length - 1; i >= 0; i--){
			
			//Positions asteroid traslated
			var posXRect = 		  asteroids[i].boundingBox.posX - asteroids[i].boundingBox.halfWidth;
			var posYRect = 		  asteroids[i].boundingBox.posY - asteroids[i].boundingBox.halfHeight;
			var posXLargestRect = asteroids[i].boundingBox.posX + asteroids[i].boundingBox.halfWidth;
			var posYLargestRect = asteroids[i].boundingBox.posY + asteroids[i].boundingBox.halfHeight;
			
			
			if(ship.alive && !ship.invencible){
				//Positions ship traslated
				var ShipPosXRect = 		  ship.boundingBox.posX - ship.boundingBox.halfWidth;
				var ShipPosYRect = 		  ship.boundingBox.posY - ship.boundingBox.halfHeight;
				var ShipPosXLargestRect = ship.boundingBox.posX + ship.boundingBox.halfWidth;
				var ShipPosYLargestRect = ship.boundingBox.posY + ship.boundingBox.halfHeight;
			
				if(AABBCollision(ShipPosXRect, ShipPosYRect, ShipPosXLargestRect, ShipPosYLargestRect, posXRect, posYRect, posXLargestRect, posYLargestRect)){
					var verticesTranslated = multiplicateMatrix3x3ByVertices(getRotZTranslationMatrix3X3(ship.angle, ship.posX, ship.posY), ship.vertices);
				
					for(let j = 0; j < verticesTranslated.length; j++){
						if(asteroids[i].collisionAsteroid(verticesTranslated[j * 2], verticesTranslated[j * 2 +1])){
							//DEATH PLAYER
							parallelEvents.push(new PlayerDeath(1));
							//DEATH ASTEROID
							asteroids[i].alive = false;
							break;
						}
					}
				}		
			}
			


			//Bullets
			if(asteroids[i].alive){
				for(let j = 0; j < arrayBullets.length; j++){
					if(arrayBullets[j] != undefined){
						//Check collision with asteroid
						if(pointVSAABBCollision(arrayBullets[j].getPosX(), arrayBullets[j].getPosY(), posXRect, posYRect, posXLargestRect, posYLargestRect)){
							if(asteroids[i].collisionAsteroid(arrayBullets[j].getPosX(), arrayBullets[j].getPosY())){
								arrayBullets[j].collided = true;
								//DEATH BULLET
								arrayBullets[j] = undefined;
								//DEATH ASTEROID
								asteroids[i].alive = false;
								break;
							}
						}
					}
				}
			}
			
			if(!asteroids[i].alive){
				killAsteroid(i);
			}

		}

		//Draw asteroids
		for(let i = 0; i < asteroids.length; i++){
			//Asteroids
			gl.uniformMatrix3fv(modelPosition, false, getRotZTranslationMatrix3X3(asteroids[i].angle, asteroids[i].posX, asteroids[i].posY));
			asteroids[i].draw();
		}
		
		//Draw bullets
		for(let i = 0; i < arrayBullets.length; i++){
			if(arrayBullets[i] != undefined){
				gl.uniformMatrix3fv(modelPosition, false, getTranslationMatrix3X3(arrayBullets[i].getPosX(), arrayBullets[i].getPosY()));
				arrayBullets[i].draw();
				
				//Reset coll debug 
				arrayBullets[i].collided = false;
			}
		}
		

		//Draw level bounds
		gl.uniformMatrix3fv(modelPosition, false, getTranslationMatrix3X3(rectangleLevelBounds.posX, rectangleLevelBounds.posY));
		gl.uniform4f(colorPosition, 0.42,0.87,0.2,1.0);
		rectangleLevelBounds.draw();

		//Draw GUI
		gl.enable(gl.BLEND);

		drawTextTexture(16, 460, 8.0, 10.0, "VIDAS " + vidas, {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
		drawTextTexture(230, 460, 8.0, 10.0, "PUNTOS " + points, {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
		drawTextTexture(500, 460, 8.0, 10.0, username.toUpperCase(), {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});


		//Draw events
		if(events.length > 0){
			events[0].draw();
		}

		for(let i = 0 ; i < parallelEvents.length; i++){
			parallelEvents[i].draw();
		}

		if(pilaLogros.length > 0)pilaLogros[0].draw();

		gl.disable(gl.BLEND);
	}



	self.onremove = function(){
		
	}

	self.resize = function(){
		rectangleCamera.updateWidthHeight(canvasWidth, canvasHeight);
	}



	/*-------------------------------EVENTS-------------------------------------*/
	//Asteroids
	function killAsteroid(_index){
		var pointsAst;
		switch(asteroids[_index].size){
			case 1:
				pointsAst = 100;
				
				soundBangSmall.play();
			break;
			case 2:
				let randAst = Math.floor(Math.random() * 2 * dificultadGlobal) + 2;
				for(let i = 0; i < randAst; i++){
					asteroids.push(new Asteroid(asteroids[_index].posX,asteroids[_index].posY, 1));
				}
				pointsAst = 20;
				
				soundBangMedium.play();
			break;
			case 3:
				for(let i = 0; i < 2 + (Math.random() * dificultadGlobal); i++){
					asteroids.push(new Asteroid(asteroids[_index].posX,asteroids[_index].posY, 2));
				}
				pointsAst = 10;
				
				soundBangLarge.play();
			break
		}

		points += Math.floor(pointsAst + (Math.log(fase + 1) * pointsAst));
		asteroidsDestroyed++;

		//See logros
		//Puntos
		if(logrosPoints.length != 0){
			if(points > logrosPoints[0].objetivo){
				logrosSubir.push(new PutLogroEvent(logrosPoints[0]));
				logrosPoints.splice(0, 1);
			}
		}

		//Asteroides
		if(logrosAsteroids.length != 0){
			if(asteroidsDestroyed > logrosAsteroids[0].objetivo){
				logrosSubir.push(new PutLogroEvent(logrosAsteroids[0]));
				logrosAsteroids.splice(0, 1);
			}
		}


		asteroids.splice(_index, 1);
	}

	//StartFase
	function StartFase(_time){
		var self = this;
		
		self.dificultad = 0;
		self.asteroids = 0;
		self.levelsize = 1000;
		self.ovnis = 0;

		function start(){
			//Load fase
			self.dificultad = fases[fase].dificultad;
			dificultadGlobal = self.dificultad;
			self.asteroids = fases[fase].asteroids;
			self.levelsize = fases[fase].levelsize;
			self.ovnis = fases[fase].ovnis;

			ship.posX = 0.0;
			ship.posY = 0.0;
			ship.angle = 0.0;
			ship.speedX = 0.0;
			ship.speedY = 0.0;

			rectangleCamera.posX = 0.0;
			rectangleCamera.posY = 0.0;

			rectangleLevelBounds.updateWidthHeight(self.levelsize, self.levelsize / ASPECTRATIO);
			
			//Load music
			//music.play();
		}
		
		function draw(){
			drawTextTexture(220, 250, 16.0, 16.0, "FASE  " + (fase + 1), {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
			drawTextTexture(250, 190, 16.0, 16.0, "START", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
		}

		function onDeath(){
			events.push(new FaseUpdate());

			//Init asteroids
			for(let i = 0; i < self.asteroids; i++){
				//Search for a site to spawn (asteroids are 120 in width/height)
				let maxSize = 90.0;
				let preparingSite = true;
				let x = 0.0;
				let y = 0.0;
				while(preparingSite){
					x = (-rectangleLevelBounds.halfWidth ) + (Math.random() * (rectangleLevelBounds.width - maxSize * 2.0)) + maxSize;
					y = (-rectangleLevelBounds.halfHeight) + (Math.random() * (rectangleLevelBounds.height - maxSize * 2.0)) + maxSize;
					//Check if intersects with player
					let halfSizeAstPlayer = (maxSize * 4.0) / 2.0;
					if(!AABBCollision(ship.boundingBox.posX - ship.boundingBox.halfWidth, ship.boundingBox.posY - ship.boundingBox.halfHeight,
					 			  ship.boundingBox.posX + ship.boundingBox.halfWidth, ship.boundingBox.posY + ship.boundingBox.halfHeight,
					 			  x - halfSizeAstPlayer, y - halfSizeAstPlayer, x + halfSizeAstPlayer, y + halfSizeAstPlayer)){
						preparingSite = false;
					}
				}
				let size = Math.floor(Math.random() * 3.0) + 1;
				asteroids.push(new Asteroid(x, y, size));
			}
		}
		
		self.constructorBase = TimedEvent;
		self.constructorBase(_time, start, function(){}, draw, onDeath);
	}
	StartFase.prototype = new TimedEvent;


	function FaseUpdate(){
		var self = this;
		
		var passedPhase = false;

		function update(){
			if(asteroids.length == 0){
				self.alive = false;
				if(vidas > 0)passedPhase = true;
			}

			if(vidas == 0)self.alive = false;
		}

		function start(){
			
		}

		function onDeath(){
			if(passedPhase){
				fase += 1;
				//Logros fase
				if(logrosFase.length != 0){
					if(fase > logrosFase[0].objetivo){
						logrosSubir.push(new PutLogroEvent(logrosFase[0]));
						logrosFase.splice(0, 1);
					}
				}

				//If there is no more fases
				if(fase > fases.length - 1){
					events.push(new GameOver(4, true));
				}else{
					events.push(new StartFase(1.8));
				}
			}else{
				events.push(new GameOver(4, false));
			}
			
		}
		
		self.constructorBase = Event;
		self.constructorBase(start, update, function(){}, onDeath);
	}
	FaseUpdate.prototype = new Event;


	//StartFase
	function GameOver(_time, _win){
		var self = this;
		
		function start(){
			//Send score
			//uploadScore();
			 
			//music.pause();
		}
		
		function draw(){
			if(_win){
				drawTextTexture(100, 250, 32.0, 32.0, "YOU WIN", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
			}else{
				drawTextTexture(32, 250, 32.0, 32.0, "GAME OVER", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
			}
		}

		function onDeath(){

			_popScreenHandler();
		}
		
		self.constructorBase = TimedEvent;
		self.constructorBase(_time, start, function(){}, draw, onDeath);
	}
	GameOver.prototype = new TimedEvent;


	function PutLogroEvent(_logro){
		var self = this;
		self.logro = _logro;

		var launchedAjax = false;

		function callbackLogro(_responseJSON){
			console.log(_responseJSON);
			if(_responseJSON.res == "OK"){
				pilaLogros.push(new TextLogroEvent(self.logro));
				self.alive = false;
			}else{
				launchedAjax = false;
				console.log("ERROR, no se pudo insertar logro");
			}
		}


		function start(){
			//putLogro({"req" : "putLogro", "logro" : self.logro.id}, callbackLogro);
			pilaLogros.push(new TextLogroEvent(self.logro));
			self.alive = false;
			launchedAjax = true;
		}

		function update(){
			if(!launchedAjax){
				//putLogro({"req" : "putLogro", "logro" : self.logro.id}, callbackLogro);
				pilaLogros.push(new TextLogroEvent(self.logro));
				self.alive = false;
				launchedAjax = true;
			}
		}
		
		start();

		self.constructorBase = ParallelEvent;
		self.constructorBase(start, update, function(){}, function(){});		
	}
	PutLogroEvent.prototype = new ParallelEvent;


	function TextLogroEvent(_logro){
		var self = this;

		self.transparency = 1.0;

		function draw(){
			let width = 200.0 / _logro.titulo.length;
			if(width > 36)width = 36.0;
			drawTextTexture(36, 40, width, width, "&", {"r" : 0.0, "g" : 0.0, "b" : 0.0, "a" : self.transparency});
			drawTextTexture(36 + width * 3.0, 40, width , width, _logro.titulo.toUpperCase(), {"r" : 0.9, "g" : 0.9, "b" : 0.9, "a" : self.transparency});
		}

		function update(_dt){
			self.transparency = Math.abs(self.time * 2.0) % 10.0;
		}


		self.constructorBase = TimedEvent;
		self.constructorBase(4.0, function(){}, update, draw, function(){});
	}
	TextLogroEvent.prototype = new TextLogroEvent;


	function PlayerDeath(_time){
		var self = this;
		
		function start(){
			vidas--;
			deaths++;
			ship.alive = false;
			
			soundBangLarge.play();

			//Logros death
			if(logrosDeath.length != 0){
				if(deaths > logrosDeath[0].objetivo){
					logrosSubir.push(new PutLogroEvent(logrosDeath[0]));
					logrosDeath.splice(0, 1);
				}
			}

			framebuffer.shake();
		}
		
		function draw(){
			
		}

		function onDeath(){
			if(vidas > 0){
				ship.alive = true;
				parallelEvents.push(new PlayerInvencibility(1.5));
			}
		}
		
		start();

		self.constructorBase = ParallelTimedEvent;
		self.constructorBase(_time, start, function(){}, draw, onDeath);
	}
	PlayerDeath.prototype = new ParallelTimedEvent;


	function PlayerInvencibility(_time){
		var self = this;
		
		function start(){
			ship.invencible = true;
		}
		
		function draw(){
			
		}

		function update(){
			ship.alpha = 0.1 + (Math.sin(self.time * 10) + 1.0 / 2.0);
		}

		function onDeath(){
			ship.invencible = false;
		}
		
		start();

		self.constructorBase = ParallelTimedEvent;
		self.constructorBase(_time, start, update, draw, onDeath);
	}
	PlayerInvencibility.prototype = new ParallelTimedEvent;



	/*--------------------------------------------------------------------------------------*/

	/*AJAX*/
	/*
	function uploadScore(){
		console.log("Sending score");
		var ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let responseJSON = JSON.parse(this.responseText);
				console.log(responseJSON);
			}
		};
		ajax.open("POST", SCOREUP, true);
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajax.send("puntos=" + points + "&tiempo=" + Math.floor(timePlaying * 1000.0) + "&ultimafase=" + (fase + 1));
	}

	function putLogro(_jsonData, _callback){
		var ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let responseJSON = JSON.parse(this.responseText);
				_callback(responseJSON);
			}
		};
		ajax.open("POST", "REST", true);
		ajax.setRequestHeader("Content-type", "application/json");
		ajax.send(JSON.stringify(_jsonData));
	}
	*/

}
GameScreen.prototype = new Screen;