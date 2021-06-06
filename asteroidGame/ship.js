const ROTATE_PER_SECOND = 360.0;
const SPEED_PER_SECOND = 10.0;
const DRAG_PER_SECOND = 0.8;
const BULLET_RECOIL = 0.2;

function Ship(_posX, _posY, _width, _height) {
	var self = this;
    self.posX = _posX;
    self.posY = _posY;
	self.width = _width;
	self.height = _height;
	self.angle = 0;
	self.speedX = 0.0;
	self.speedY = 0.0;

	self.alive = true;
	
	self.forward = false;
	self.rotate = false;
	self.rotateAnti = false;
	self.createBullet = false;

	self.invencible = false;
	self.alpha = 1.0;
	
	self.timeLastBulletFired = 0.0;
	
	let diameter;
	if(self.width > self.height){
		diameter = self.width;
	}else{
		diameter = self.height;
	}

	self.boundingBox = new Rectangle(self.posX, self.posY, diameter, diameter);
	self.boundingBoxReduced = new Rectangle(self.posX, self.posY, diameter / 3.0, diameter / 3.0);
	
	self.vertices = new Float32Array([
	   - self.width / 2.0, - self.height / 2.0,
	   0.0,  self.height / 2.0,
	   self.width / 2.0, - self.height / 2.0,
	   0.0, self.height * 0.3 - self.height / 2.0
	]);
	//Set vertexBuffer
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	
	
	
	self.draw = function() {
		if(self.alive){
			gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
			gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 2 * 4, 0);
			gl.enableVertexAttribArray(vertexPosition);

			gl.enable(gl.BLEND);
			if(self.invencible){
				gl.uniform4f(colorPosition, 1.0,1.0,1.0, self.alpha);
			}else{
				gl.uniform4f(colorPosition, 1.0,1.0,1.0,1.0);
			}
			gl.drawArrays(gl.LINE_LOOP, 0, 4);
			gl.disable(gl.BLEND);
		}
	};
	
	self.rotateAntiButton = function(){
		self.rotateAnti = true;
	};
	
	self.rotateButton = function(){
		self.rotate = true;
	};
	
	self.forwardButton = function(){
		self.forward = true;
	};
	
	self.createBulletButton = function(){
		self.createBullet = true;
	};
	
	self.update = function(_dt, _levelBounds, _arrayBullets){
		if(self.rotate){
			self.angle -= ROTATE_PER_SECOND * _dt;
			self.rotate = false;
		}
		if(self.rotateAnti){
			self.angle += ROTATE_PER_SECOND * _dt;
			self.rotateAnti = false;
		}
		if(self.forward){
			var radians = ((self.angle + 90.0) * Math.PI) / 180.0;
			var x = Math.cos(radians);
			var y = Math.sin(radians);
			self.speedX += x  * SPEED_PER_SECOND * _dt;
			self.speedY += y  * SPEED_PER_SECOND * _dt;
			self.forward = false;
		}
		
		if(self.createBullet && self.alive){
			if(self.timeLastBulletFired > BULLET_RECOIL){
				self.timeLastBulletFired = 0.0;
				
				var bulletIndex = -1;
				for(var i = 0; i < _arrayBullets.length; i++){
					if(_arrayBullets[i] == undefined){
						bulletIndex = i;
						break;
					}
				}
				if(bulletIndex != -1){
					//Calculate position of 2 vertex of ship
					var vertexOnSpace = multiplicateMatrix3x3ByVertex(getRotZTranslationMatrix3X3(self.angle, self.posX, self.posY), [self.vertices[2],self.vertices[3]]);
					_arrayBullets[bulletIndex] = new Bullet(vertexOnSpace[0], vertexOnSpace[1], self.angle);
					
					soundFire.play();
				}
			}
			self.createBullet = false;
		}
		
		//Update bullet recoil time
		self.timeLastBulletFired += _dt;
		
		//-------------------Update positions---------------------
		//Check if next update is going out of bounds
		let shipX = self.posX - self.boundingBoxReduced.halfWidth + self.speedX;
		let shipY = self.posY - self.boundingBoxReduced.halfHeight + self.speedY;
		if(!AABBContains(shipX, shipY,shipX + self.boundingBoxReduced.width, shipY + self.boundingBoxReduced.height,
			_levelBounds.posX - _levelBounds.halfWidth, _levelBounds.posY - _levelBounds.halfHeight, _levelBounds.posX + _levelBounds.halfWidth, _levelBounds.posY + _levelBounds.halfHeight)){
			//Calcular posicion
			
			//Minkowski differences
			//Inflar posiciones del rectangulo que forma los bounds del nivel con la mitad del width y height de la nave
			//Con esto solo necesitamos comprobar la interseccion entre el centro de la nave (self.posX, self.posY) y 
			//los bounds del nivel
			
			let levelBoundsXInfl = _levelBounds.posX - _levelBounds.halfWidth + self.boundingBoxReduced.halfWidth; 
			let levelBoundsYInfl = _levelBounds.posY - _levelBounds.halfHeight + self.boundingBoxReduced.halfHeight;
			let levelBoundsXLInfl = _levelBounds.posX + _levelBounds.halfWidth - self.boundingBoxReduced.halfWidth; 
			let levelBoundsYLInfl = _levelBounds.posY + _levelBounds.halfHeight - self.boundingBoxReduced.halfHeight;
			
			/*
			let rayIntersect = intersectRayAABB(levelBoundsXInfl, levelBoundsYInfl,levelBoundsXLInfl, levelBoundsYLInfl,
				 self.posX, self.posY, self.speedX, self.speedY);
				
			if(rayIntersect != null){
				self.speedX = rayIntersect.tmax * self.speedX;
				self.speedY = rayIntersect.tmax * self.speedY;
				
				self.posX -= rayIntersect.normalX;
				self.posY -= rayIntersect.normalY;	
			}
			*/
			
			//X-
			if(self.posX + self.speedX < levelBoundsXInfl){
				self.speedX = levelBoundsXInfl - self.posX;
			}
			
			//X+
			if(self.posX + self.speedX > levelBoundsXLInfl){
				self.speedX = levelBoundsXLInfl - self.posX;
			}
			
			//Y-
			if(self.posY + self.speedY < levelBoundsYInfl){
				self.speedY = levelBoundsYInfl - self.posY ;
			}
			
			//Y+
			if(self.posY + self.speedY > levelBoundsYLInfl){
				self.speedY = levelBoundsYLInfl - self.posY;
			}
		}
		
		if(!self.alive){
			self.speedX = 0.0;
			self.speedY = 0.0;
		}


		self.posX += self.speedX;
		self.posY += self.speedY;
		self.boundingBox.updatePosition(self.posX, self.posY);
	

		//Update speed
		self.speedX /= 1.0 + DRAG_PER_SECOND * _dt;
		self.speedY /= 1.0 + DRAG_PER_SECOND * _dt;
		if(Math.abs(self.speedX) < 0.005)self.speedX = 0.0;
		if(Math.abs(self.speedY) < 0.005)self.speedY = 0.0;
	};
	
	
	
}