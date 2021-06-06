function Asteroid(_posX, _posY, _size) {
	var self = this;
	self.posX = _posX;
	self.posY = _posY;
	self.speedX;
	self.speedY;
	self.angle = 0.0;
	
	//Set Size
	self.size = _size;
	switch(_size){
		case 1:
			self.radius = 15.0;
			break;
		case 2: 
			self.radius = 25.0;
			break;
		case 3: 
			self.radius = 40.0;
		break;
	}
	self.width = self.radius * 2.0;
	self.height = self.radius * 2.0;
	
	
	//Set Bounding box
	self.boundingBox = new Rectangle(self.posX, self.posY, self.width, self.width);
	
	//Set vertices
	self.vertexNum = self.size * 5;
	self.step = 360.0 / self.vertexNum;
	
	//Set velocity
	self.speedX = (Math.random() - 0.5) * 6.0;
	self.speedY = (Math.random() - 0.5) * 6.0;

	//Rotation depends on velocity( > vel == > Rot)
	self.rotatePerSecond =  ((Math.abs(self.speedX) + Math.abs(self.speedY)) * 20.0);
	
	self.alive = true;
	
	//Create model array of asteroid
	var angleCreate = 0.0;
	var rad = 0.0;
	var arrayVert = new Array(self.vertexNum * 2);
	//Use distance 
	for(var i = 0; i < self.vertexNum * 2; i+=2){
		rad = (angleCreate * Math.PI) / 180.0;
		var randomDistance = ((Math.random() * 0.6) + 0.4);
		arrayVert[i] = Math.cos(rad) * self.radius * randomDistance;   // x
		arrayVert[i+1] = Math.sin(rad) * self.radius * randomDistance; // y
		angleCreate += self.step;
	}
	self.vertices = new Float32Array(arrayVert);
	
	//Set vertexBuffer
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	
	//Point vertexBuffer (Asteroid center)
	self.pointBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0,0.0]), gl.STATIC_DRAW);
	
	
	self.draw = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
		gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 2 * 4, 0);
		gl.enableVertexAttribArray(vertexPosition);
		gl.drawArrays(gl.LINE_LOOP, 0, self.vertexNum);
	};
	
	self.update = function(_dt, _levelBounds){
		//Check if next update is going out of bounds
		let X = self.posX - self.boundingBox.halfWidth + self.speedX;
		let Y = self.posY - self.boundingBox.halfHeight + self.speedY;
		if(!AABBContains(X, Y, X + self.boundingBox.width, Y + self.boundingBox.height,
			_levelBounds.posX - _levelBounds.halfWidth, _levelBounds.posY - _levelBounds.halfHeight, _levelBounds.posX + _levelBounds.halfWidth, _levelBounds.posY + _levelBounds.halfHeight)){
			
			//Minkowski differences
			let levelBoundsXInfl = _levelBounds.posX - _levelBounds.halfWidth + self.boundingBox.halfWidth / 2.0; 
			let levelBoundsYInfl = _levelBounds.posY - _levelBounds.halfHeight + self.boundingBox.halfHeight / 2.0;
			let levelBoundsXLInfl = _levelBounds.posX + _levelBounds.halfWidth - self.boundingBox.halfWidth / 2.0; 
			let levelBoundsYLInfl = _levelBounds.posY + _levelBounds.halfHeight - self.boundingBox.halfHeight / 2.0;
			
			if(self.posX + self.speedX < levelBoundsXInfl || self.posX + self.speedX > levelBoundsXLInfl){
				self.speedX = -self.speedX;
			}
			
			if(self.posY + self.speedY < levelBoundsYInfl || self.posY + self.speedY > levelBoundsYLInfl){
				self.speedY = -self.speedY;
			}
		}
		
		self.posX += self.speedX;
		self.posY += self.speedY;
		self.boundingBox.updatePosition(self.posX, self.posY);
		
		
		self.angle += self.rotatePerSecond * _dt;
	};



	/*
		_point	   			   --> Point to check intersection
	*/

	//Test collision with Asteroid per vertex
	/*
	*	Primero tenermos que calcular las posiciones de los vertices de la nave en el espacio real,
	*	para ello podemos multiplicar sus vertices por la matriz de rotacion y transformacion
	*
	*	
	*	Hacemos un loop por cada vertice de la nave
	*		Calculamos el angulo entre el vertice de la nave y el centro del asteroide
	*		Calculamos el angulo final con la rotacion del asteroide para saber que vertice es el que esta mas cerca
	*		AnguloMod = (Angulo vertice y asteroide) - AnguloRotacion asteroide
	*		Calculamos el vertice mas cercano:
	*
	*			Si el angulo coincide con el anguloPaso para construir el asteroide (360.0 / verticesAsteroide) == AnguloMod			
	*			Tenemos el vertice que nos interesa, sino tenemos que saber cual es el que esta mas cerca y ademas
	*			calcular el vertice por el cual se forma la linea del asteroide
	*
	*			Una vez teniendo los dos puntos, haberiguamos el tercer vertice que estaria en AnguloMod usando Lerp
	*			
	*			Ahora que tenemos el vertice del asteroide donde podria haber interseccion calculamos 
	*			la distancia entre el centro del asteroide y el nuevo punto para haberiguar el radio del
	*			circulo por el cual tenemos que checkear colision
	*
	*			Calculamos colision del circulo con origen el centro del asteroide y radio calculado contra
	*			el vertice que estamos calculando, si hay colision el vertice esta dentro del asteroide
	*
	*
	*/
	self.collisionAsteroid = function(_pointX, _pointY){
		var verticesAstTranslated = multiplicateMatrix3x3ByVertices(getRotZTranslationMatrix3X3(self.angle, self.posX, self.posY), self.vertices);

		//Angulo de dos vectores (centro asteroide x vertice)
		var radians = Math.atan2(self.posY - _pointY, self.posX - _pointX);
		var angle = (radians * 180 / Math.PI) + 180.0; //Get full angle
		//Put angle rotated asteroid
		if(angle - self.angle < 0){
			angle = 360.0 + ((angle - self.angle) % 360);
		}else{
			angle -= self.angle ;
		}
		
		if(DEBUG){
			console.log();
			console.log("------------------------------------------------------------");
			console.log("angle vertice: " + angle);
			console.log("num vertices of asteroid: " + self.vertexNum + " length vertices array: " + self.vertexNum * 2);
			//Conseguir los vertices del asteroide mas cerca del vertice de la nave
			
			
			//debug: make a point which distance from renter asteroid is always 100 and rotates
			let rad = (angle * Math.PI) / 180.0;
			let pointX = self.radius;
			let pointY = 0.0;
			let pointXbefore = pointX;
			pointX = pointX * Math.cos(rad) - pointY * Math.sin(rad);
			pointY = pointXbefore * Math.sin(rad) + pointY * Math.cos(rad);
			pointX += self.posX;
			pointY += self.posY;
			let point = new Point(pointX, pointY, 3);
			gl.uniformMatrix3fv(modelPosition, false, getTranslationMatrix3X3(point.posX, point.posY));
			point.draw();
		}
		
		var indexFirstVertex = Math.floor(angle / self.step);
		var indexSecondVertex = Math.ceil(angle / self.step);
		//TODO Solve last vert
		if(indexSecondVertex == self.vertexNum)indexSecondVertex = 0;
		if(indexFirstVertex == self.vertexNum)indexFirstVertex = 0;
		
		if(DEBUG){
			console.log("First vertec ast: " + indexFirstVertex  + " second vertex ast: " + indexSecondVertex);
			console.log("FirstVert: x: " + verticesAstTranslated[indexFirstVertex * 2] + " y: " + verticesAstTranslated[indexFirstVertex * 2 + 1]);
			console.log("SecondVert: x: " + verticesAstTranslated[indexSecondVertex * 2] + " y: " + verticesAstTranslated[indexSecondVertex * 2 + 1]);
		}
		
		//Get distance from the center
		//Lerp
		let t = (angle / self.step) - indexFirstVertex;
		let lerpX = (1 - t) * (verticesAstTranslated[indexFirstVertex * 2]) + t * (verticesAstTranslated[indexSecondVertex * 2]);
		let lerpY = (1 - t) * (verticesAstTranslated[indexFirstVertex * 2 + 1]) + t * (verticesAstTranslated[indexSecondVertex * 2 + 1]);
		
		if(DEBUG){
			console.log("l: " + t);
			console.log("lerpX: " + lerpX);
			console.log("lerpY: " + lerpY);
			
			//Draw point of asteroid
			let point = new Point(lerpX, lerpY, 3);
			gl.uniformMatrix3fv(modelPosition, false, getTranslationMatrix3X3(point.posX, point.posY));
			point.draw();
		}
		
		
		//Calculate distance between point & new point on asteroid
		let DistancePointAsteroid = Math.sqrt(Math.pow(self.posX - lerpX,2) + Math.pow(self.posY - lerpY,2));
		let DistanceShipAsteroid = Math.sqrt(Math.pow(self.posX - _pointX,2) + Math.pow(self.posY - _pointY,2));
		
		if(DistanceShipAsteroid < DistancePointAsteroid){
			return true;
		}else{
			return false;
		}
	};
}




