function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var errorLog = 'An error occurred compiling ';
		switch(type){
		case gl.VERTEX_SHADER:
			errorLog += ' Vertex Shader ';
			break;
		case gl.FRAGMENT_SHADER:
			errorLog += ' Fragment Shader ';
			break;
		}
		alert(errorLog + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

//Creates and compile a shaderProgram and returns it
function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	//Create the shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function multiplicateMatrix3x3(matrix1, matrix2){
	//Always rows x columns
	//Remember matrix are declared in column mayor order
	//				[0 3 6]						[0 1 2]
	//Columns mayor [1 4 7]  Row mayor (normal) [3 4 5]
	//				[2 5 8]						[6 7 8]
	return [matrix1[0] * matrix2[0] + matrix1[3] * matrix2[1] + matrix1[6] * matrix2[2],
			matrix1[1] * matrix2[0] + matrix1[4] * matrix2[1] + matrix1[7] * matrix2[2],
			matrix1[2] * matrix2[0] + matrix1[5] * matrix2[1] + matrix1[8] * matrix2[2],
			
			matrix1[0] * matrix2[3] + matrix1[3] * matrix2[4] + matrix1[6] * matrix2[5],
			matrix1[1] * matrix2[3] + matrix1[4] * matrix2[4] + matrix1[7] * matrix2[5],
			matrix1[2] * matrix2[3] + matrix1[5] * matrix2[4] + matrix1[8] * matrix2[5],
			
			matrix1[0] * matrix2[6] + matrix1[3] * matrix2[7] + matrix1[6] * matrix2[8],
			matrix1[1] * matrix2[6] + matrix1[4] * matrix2[7] + matrix1[7] * matrix2[8],
			matrix1[2] * matrix2[6] + matrix1[5] * matrix2[7] + matrix1[8] * matrix2[8]];
}

function multiplicateMatrix3x3ByVertices(matrix1, vertices){
	//Always rows x columns
	//Remember matrix are declared in column mayor order
	//				[0 3 6]						[0 1 2]
	//Columns mayor [1 4 7]  Row mayor (normal) [3 4 5]
	//				[2 5 8]						[6 7 8]
	var verticesProcessed = new Array(vertices.length);
	for(var i = 0; i < vertices.length; i+=2){
		var vector = [matrix1[0] * vertices[i] + matrix1[3] * vertices[i+1] + matrix1[6] * 1.0,
					  matrix1[1] * vertices[i] + matrix1[4] * vertices[i+1] + matrix1[7] * 1.0,
					  matrix1[2] * vertices[i] + matrix1[5] * vertices[i+1] + matrix1[8] * 1.0]
		verticesProcessed[i] = vector[0];
		verticesProcessed[i+1] = vector[1];
	}
	return verticesProcessed;
}

function multiplicateMatrix3x3ByVertex(matrix1, vertex){
	return [matrix1[0] * vertex[0] + matrix1[3] * vertex[1] + matrix1[6] * 1.0,
			matrix1[1] * vertex[0] + matrix1[4] * vertex[1] + matrix1[7] * 1.0,
			matrix1[2] * vertex[0] + matrix1[5] * vertex[1] + matrix1[8] * 1.0]
}

function inverse(m) {
    var t00 = m[1 * 3 + 1] * m[2 * 3 + 2] - m[1 * 3 + 2] * m[2 * 3 + 1];
    var t10 = m[0 * 3 + 1] * m[2 * 3 + 2] - m[0 * 3 + 2] * m[2 * 3 + 1];
    var t20 = m[0 * 3 + 1] * m[1 * 3 + 2] - m[0 * 3 + 2] * m[1 * 3 + 1];
    var d = 1.0 / (m[0 * 3 + 0] * t00 - m[1 * 3 + 0] * t10 + m[2 * 3 + 0] * t20);
    return [
       d * t00, -d * t10, d * t20,
      -d * (m[1 * 3 + 0] * m[2 * 3 + 2] - m[1 * 3 + 2] * m[2 * 3 + 0]),
       d * (m[0 * 3 + 0] * m[2 * 3 + 2] - m[0 * 3 + 2] * m[2 * 3 + 0]),
      -d * (m[0 * 3 + 0] * m[1 * 3 + 2] - m[0 * 3 + 2] * m[1 * 3 + 0]),
       d * (m[1 * 3 + 0] * m[2 * 3 + 1] - m[1 * 3 + 1] * m[2 * 3 + 0]),
      -d * (m[0 * 3 + 0] * m[2 * 3 + 1] - m[0 * 3 + 1] * m[2 * 3 + 0]),
       d * (m[0 * 3 + 0] * m[1 * 3 + 1] - m[0 * 3 + 1] * m[1 * 3 + 0]),
    ];
}

function getRotationZMatrix3X3(_angle){
	let radians = (_angle * Math.PI) / 180.0;
	let cosine = Math.cos(radians);
	let sine = Math.sin(radians);
	return new Float32Array([cosine,sine,0.0,-sine,cosine,0.0,0.0,0.0,1.0]);
}

function getTranslationMatrix3X3(_x, _y){
	return new Float32Array([1.0,0.0,0.0,0.0,1.0,0.0, _x, _y,1.0]);
}

function getScaleTranslationMatrix3X3(_x, _y, _scaleX, _scaleY){
	return new Float32Array([
		_scaleX,		0.0,				0.0,
		0.0,				_scaleY,		0.0,
		_x, 				_y,					1.0]);
}

function getRotZTranslationMatrix3X3(_angle, _x, _y){
	let radians = (_angle * Math.PI) / 180.0;
	let cosine = Math.cos(radians);
	let sine = Math.sin(radians);
	return new Float32Array([cosine,sine,0.0,-sine,cosine,0.0,_x,_y,1.0]);
}


//-------------------------------------Collisions--------------------------------------------
//
//		-----------alx,aly
//		|         |
//		|         |
// 		|         |
//		|         |
//		|         |
//ax,ay	-----------
//
function AABBCollision(ax, ay, alx, aly, bx, by, blx, bly){
	if(ax > blx)return false;
	if(alx < bx)return false;
	if(ay > bly)return false;
	if(aly < by)return false;
	return true;
}

function pointVSAABBCollision(pointX, pointY, bx, by, blx, bly){
	if(pointX < bx)return false;
	if(pointX > blx)return false;
	if(pointY < by)return false;
	if(pointY > bly)return false;
	return true;
}

//a --> rectangle
//b --> rectangle container
function AABBContains(ax, ay, alx, aly, bx, by, blx, bly){
	if(ax < bx)return false;
	if(alx > blx)return false;
	if(ay < by)return false;
	if(aly > bly)return false;
	return true;
}

//a --> AABB
//p --> origen del rayo
//v --> vector rayo
function intersectRayAABB(ax, ay, alx, aly, px, py, vx, vy){
	//X
	if(vx != 0.0){
		let invVx = 1.0 / vx;
		var txMin = (ax - px) * invVx;
		var txMax = (alx - px) * invVx;
		
		if(txMin > txMax){
			let swapVar = txMax;
			txMax = txMin;
			txMin = swapVar;
		}
	}else{
		var txMin = Number.MIN_SAFE_INTEGER;
		var txMax = Number.MAX_SAFE_INTEGER;
	}
	
	
	//Y
	if(vy != 0.0){
		let invVy = 1.0 / vy;
		var tyMin = (ay - py) * invVy;
		var tyMax = (aly - py) * invVy;

		if(tyMin > tyMax){
			let swapVar = tyMax;
			tyMax = tyMin;
			tyMin = swapVar;
		}
	}else{
		var tyMin = Number.MIN_SAFE_INTEGER;
		var tyMax = Number.MAX_SAFE_INTEGER;
	}
	

	//Calculate tmin & tmax
	var tmin = Math.max(txMin, tyMin, 0.0);
	var tmax = Math.min(txMax, tyMax, 1.0);
	
	
	if(tmin < tmax){
		
		console.log("Ray intersect....");
		console.log("ax: " + ax);
		console.log("alx: " + alx);
		console.log("ay: " + ay);
		console.log("aly: " + aly);
		console.log("px: " + px);
		console.log("py: " + py);
		console.log("vx: " + vx);
		console.log("vy: " + vy);
		console.log("txMin: " + txMin);
		console.log("txMax: " + txMax);
		console.log("tyMin: " + tyMin);
		console.log("tyMax: " + tyMax);
		console.log("tmin: " + tmin);
		console.log("tmax: " + tmax);
		
		console.log("----------------");
		
		var normalX = 0.0;
		var	normalY = 0.0;
		
		//Normals
		let nuevoX = px + tmax * vx;
		let nuevoY = py + tmax * vy;
		//X+
		if(nuevoX == alx) normalX = 1.0;
		
		//X-
		if(nuevoX == ax) normalX = -1.0;
		
		//Y+
		if(nuevoY == aly) normalY = 1.0;
		
		//Y-
		if(nuevoY == ay) normalY = -1.0;
		
		return {'tmin' : tmin, 'tmax' : tmax, 'normalX' : normalX, 'normalY' : normalY};
	}else{
		return null;
	}
}
