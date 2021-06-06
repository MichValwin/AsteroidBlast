function Bullet(_posX, _posY, _angleVelocity){
	var self = this;
	self.point = new Point(_posX, _posY, 3);
	self.velocity  = 300.0;
	//Calculate speed
	var radians = ((_angleVelocity + 90.0) * Math.PI) / 180.0;
	self.speedX = Math.cos(radians) * self.velocity;
	self.speedY = Math.sin(radians) * self.velocity;
	
	//Debug vars
	self.collided = false;
	
	self.getPosX = function(){
		return self.point.posX;
	};
	
	self.getPosY = function(){
		return self.point.posY;
	};
	
	self.draw = function() {
		self.point.draw();
	};
	
	self.update = function(_dt){
		self.point.posX += self.speedX * _dt;
		self.point.posY += self.speedY * _dt;
	};
}