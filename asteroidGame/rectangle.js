function Rectangle(_posX, _posY, _width, _height){
	var self = this;
	self.posX = _posX; 	//Center of rectangle
	self.posY = _posY; 	//Center of rectangle
	self.width = _width;
	self.height = _height;
	self.angle = 0.0;
	self.halfWidth = _width / 2.0;
	self.halfHeight = _height / 2.0;
	
	//Array vertices (Model center is in 0.0)
	self.vertices = new Float32Array([
		-self.halfWidth, -self.halfHeight,
		-self.halfWidth, self.halfHeight,
		self.halfWidth, self.halfHeight,
		self.halfWidth, -self.halfHeight
	]);
	
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	
	
	self.draw = function(){
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
		gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 2 * 4, 0);
		gl.enableVertexAttribArray(vertexPosition);
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	};
	
	self.updatePosition = function(_posX, _posY){
		self.posX = _posX;
		self.posY = _posY;
	};

	self.updateWidthHeight = function(_width, _height){
		self.width = _width;
		self.height = _height;
		self.halfWidth = _width / 2.0;
		self.halfHeight = _height / 2.0;

		//
		self.vertices = new Float32Array([
			-self.halfWidth, -self.halfHeight,
			-self.halfWidth, self.halfHeight,
			self.halfWidth, self.halfHeight,
			self.halfWidth, -self.halfHeight
		]);
		
		self.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	};
}
