function Point(_posX, _posY, _width){
	var self = this;
	self.posX = _posX;
	self.posY = _posY;
	self.width = _width;
	
	//Do rectangle
	self.vertices = new Float32Array([-self.width, -self.width,
									  -self.width,  self.width,
									   self.width,  self.width,
									   
									  -self.width, -self.width,
									   self.width,  self.width,
									   self.width, -self.width]);
	
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	
	self.draw = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
		gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 2 * 4, 0); //VertexPosition deberia estar declarado antes de llamar a la funcion
		gl.enableVertexAttribArray(vertexPosition);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
}