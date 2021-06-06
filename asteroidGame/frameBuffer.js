/*Shader for GUI textured elements (TEXT)*/  
const vertexTextureShaderSource = `
    attribute vec2 aVertexPosition;
	attribute vec2 aTexcoord;
	
	varying vec2 vTexcoord;

	uniform vec2 utranslate;

    void main() {
	  vec3 pos = vec3(aVertexPosition, 1.0);
	  
      gl_Position = vec4(pos.x + utranslate.x, pos.y + utranslate.y, 0.0, 1.0);
	  vTexcoord = aTexcoord;
    }
  `;

const fragmentTextureShaderSource = `
	precision mediump float;
	
	varying vec2 vTexcoord;
	
	uniform float uTime;

	uniform vec4 uColor;
	uniform sampler2D uTexture;

	const float offset = 1.0 / 800.0; 
	
    void main() {
    	vec2 texCoordAlter = vec2(vTexcoord.s /* +  sin(1280.0 * (gl_FragCoord.y / 700.0) + uTime * 10.0) * 0.0005 */, vTexcoord.t);


    	vec2 offsets[9];
        offsets[0] = vec2(-offset,  offset); // top-left
        offsets[1] = vec2( 0.0,    offset); // top-center
        offsets[2] = vec2( offset,  offset); // top-right
        offsets[3] = vec2(-offset,  0.0);   // center-left
        offsets[4] = vec2( 0.0,    0.0);   // center-center
        offsets[5] = vec2( offset,  0.0);   // center-right
        offsets[6] = vec2(-offset, -offset); // bottom-left
        offsets[7] = vec2( 0.0,   -offset); // bottom-center
        offsets[8] = vec2( offset, -offset); // bottom-right    
	    
	    float blur = 8.0;

	    float kernel[9];
	    kernel[0] = 1.0 / blur;
	    kernel[1] = 0.0 / blur;
	    kernel[2] = 1.0 / blur;
	    kernel[3] = 0.0 / blur;
	    kernel[4] = 0.0 / blur;
	    kernel[5] = 0.0 / blur;
	    kernel[6] = 1.0 / blur;
	    kernel[7] = 0.0 / blur;
	    kernel[8] = 1.0 / blur;




    	vec3 sampleTex[9];
	    for(int i = 0; i < 9; i++){
	        sampleTex[i] = vec3(texture2D(uTexture, texCoordAlter.st + offsets[i]));
	    }



		vec4 colorTexture = texture2D(uTexture, texCoordAlter);

		vec3 col = vec3(0.0);
    	for(int i = 0; i < 9; i++)
        	col += sampleTex[i] * kernel[i];



		gl_FragColor = vec4(col + colorTexture.rgb, 0.0);
    }
  `;


function FrameBufferObject(gl, _width, _height){
	var self = this;
	self.time = 0.0;
	self.counter = 0.0;
	self.shakeBool = false;

	//Shader
	self.shaderFrameBuffer = initShaderProgram(gl, vertexTextureShaderSource, fragmentTextureShaderSource);

	
	gl.useProgram(self.shaderFrameBuffer);
	//ShaderProgram attributes and uniforms
	self.vertexPositionFrame = gl.getAttribLocation(self.shaderFrameBuffer, 'aVertexPosition');
	self.texcoordPositionFrame = gl.getAttribLocation(self.shaderFrameBuffer, 'aTexcoord');

	self.colorPositionFrame = gl.getUniformLocation(self.shaderFrameBuffer, 'uColor');

	self.timePositionFrame = gl.getUniformLocation(self.shaderFrameBuffer, 'uTime');
	self.translatePosFrame = gl.getUniformLocation(self.shaderFrameBuffer, 'utranslate');

	gl.uniform2f(self.translatePosFrame, 0.0, 0.0);
	gl.uniform1f(self.timePositionFrame, self.time);


	//Set vertexBuffer
	/*Rectangle Model*/
	let vertices = new Float32Array([
			//Vertex positions		//TexturePositions
		   -1.0,  1.0, 		0.0, 1.0,
		    1.0, -1.0, 		1.0, 0.0,
		   -1.0, -1.0, 		0.0, 0.0,
			
		   -1.0,  1.0, 		0.0, 1.0,
		    1.0,  1.0,		1.0, 1.0,
		    1.0, -1.0,		1.0, 0.0
	]);
		
	//Set vertexBuffer
	self.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);




	//Create texture
    self.targetTextureWidth = _width;
    self.targetTextureHeight = _height;
    self.targetTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, self.targetTexture);
     
    
	// define size and format of level 0
	let internalFormat = gl.RGBA;
	let border = 0;
	let format = gl.RGBA;
	let type = gl.UNSIGNED_BYTE;
	let data = null;
	gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, self.targetTextureWidth, self.targetTextureHeight, border, format, type, data);

	//Set filtering
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    


	self.frameBuffer =  gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, self.frameBuffer);


    //Attach texture to framebuffer
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, self.targetTexture, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);


	self.bind = function(gl){
		gl.bindFramebuffer(gl.FRAMEBUFFER, self.frameBuffer);
	};

	self.unbind = function(gl){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};

	self.draw = function(gl){
		gl.useProgram(self.shaderFrameBuffer);

		gl.bindTexture(gl.TEXTURE_2D, self.targetTexture);
		gl.bindBuffer(gl.ARRAY_BUFFER, self.vertexBuffer);

		gl.vertexAttribPointer(self.vertexPositionFrame, 2, gl.FLOAT, false, 4 * 4, 0);
		gl.enableVertexAttribArray(self.vertexPositionFrame);
		gl.vertexAttribPointer(self.texcoordPositionFrame, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
		gl.enableVertexAttribArray(self.texcoordPositionFrame);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};

	self.update = function(dt){
		self.time += dt;

		gl.uniform1f(self.timePositionFrame, self.time);


		if(self.shakeBool){
			self.counter += dt;

			var x = Math.sin(self.time * 70.0) / 100.0;
			var y = Math.sin(self.time * 70.0) / 512.0;
			gl.uniform2f(self.translatePosFrame, x, y);

			if(self.counter > 0.3){
				self.shakeBool = false;
				gl.uniform2f(self.translatePosFrame, 0.0, 0.0);
			} 
		}
	};

	self.shake = function(){
		self.counter = 0;
		self.shakeBool = true;
	};

	self.resize = function(gl, _width, _height){
		gl.deleteTexture(self.targetTexture);
		gl.deleteFramebuffer(self.frameBuffer);

		//Create render Texture
		self.targetTextureWidth = _width;
	    self.targetTextureHeight = _height;
	    self.targetTexture = gl.createTexture();

	    gl.bindTexture(gl.TEXTURE_2D, self.targetTexture);
	     
	    
		// define size and format of level 0
		let internalFormat = gl.RGBA;
		let border = 0;
		let format = gl.RGBA;
		let type = gl.UNSIGNED_BYTE;
		let data = null;
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, self.targetTextureWidth, self.targetTextureHeight, border, format, type, data);

		//Set filtering
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


		self.frameBuffer =  gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, self.frameBuffer);

	    //Attach texture to framebuffer
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, self.targetTexture, 0);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};
}