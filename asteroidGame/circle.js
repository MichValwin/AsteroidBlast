function Circle(posX, posY, radius){
	var self = this;
	self.vertexNum = 30;
	self.angle = 0.0;
	self.radius = radius;
	self.posX = posX;
	self.posY = posY;
	var arrayVert = new Array(self.vertexNum * 2);
	
	var step = 360.0 / self.vertexNum;
	var angleCreate = 0.0;
	var rad = 0.0;
	//Compose circle
	for(var i = 0; i < arrayVert.length; i+=2){
		rad = (angleCreate * Math.PI) / 180.0;
		arrayVert[i] = Math.cos(rad) * self.radius;
		arrayVert[i+1] = Math.sin(rad) * self.radius;
		angleCreate += step;
	}
	//Array vertices
	self.vertices = new Float32Array(arrayVert);

	//Set vertexBuffer
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.STATIC_DRAW);
	
	
	self.draw = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
		gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 2 * 4, 0);
		gl.enableVertexAttribArray(vertexPosition);
		gl.drawArrays(gl.LINE_LOOP, 0, self.vertexNum);
	};
}