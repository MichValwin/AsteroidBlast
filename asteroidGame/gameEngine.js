var canvas = null;
const ASPECTRATIO = 1920 / 1080;

const DEBUG = false;

const FASES = "/fases";
const SCOREUP = "/scoreup";
const REST = "/REST";

//Sounds & Music
//var music = new Audio('./sounds/spaceInvaders.mp3');
//music.loop = true;

var soundBangLarge = new Audio('./asteroidGame/sounds/bangLarge.wav');
soundBangLarge.volume = 0.1;
var soundBangMedium = new Audio('./asteroidGame/sounds/bangMedium.wav');
soundBangMedium.volume = 0.1;
var soundBangSmall = new Audio('./asteroidGame/sounds/bangSmall.wav');
soundBangSmall.volume = 0.1;
var soundFire = new Audio('./asteroidGame/sounds/fire.wav');
soundFire.volume = 0.1;

//Screens
const START_SCREEN = 0;
const GAME_SCREEN = 1;
const LOAD_SCREEN = 2;

var canvasWidth = 0;
var canvasHeight = 0;

var gl = null;

function initAsteroidGame(){
	canvas = document.getElementById("webGL-interface");

	//Resize canvas
	canvas.width = 640;
	canvas.height = 360;
	canvasWidth = 640;
	canvasHeight = 360;


	//WebGL initialization
	gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl",  { alpha: false}));
	if(!gl){
		alert("Tu navegador no parece soportar webGL!");
	}

	//----Font
	shaderFont = initShaderProgram(gl, vertexTextureGUIShaderSource, fragmentTextureGUIShaderSource);

	//Font shader attributes and uniforms
	vertexPositionText = gl.getAttribLocation(shaderFont, 'aVertexPosition');
	texcoordPositionText = gl.getAttribLocation(shaderFont, 'aTexcoord');
	modelPositionText = gl.getUniformLocation(shaderFont, 'uModel');

	colorPositionText = gl.getUniformLocation(shaderFont, 'uColor');
	translateTexcoord = gl.getUniformLocation(shaderFont, 'uTranslateTexcoord');

	//Set vertexBuffer
	vertexBufferText = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferText);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	
	fontTexture = loadImageAndCreateTexture(fontBitmap);


	//----Framebuffer
	framebuffer = new FrameBufferObject(gl, canvasWidth, canvasHeight);

	shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

	//shaderProgram attributes and uniforms
	vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	modelPosition = gl.getUniformLocation(shaderProgram, 'uModel');
	projectionPosition = gl.getUniformLocation(shaderProgram, 'uProj');
	cameraPosition = gl.getUniformLocation(shaderProgram, 'uCamera');

	resolutionPosition = gl.getUniformLocation(shaderProgram, 'uResolution');
	colorPosition = gl.getUniformLocation(shaderProgram, 'uColor');
	//----

	//Scissor
	gl.enable(gl.SCISSOR_TEST);

	//Add Load screen
	addScreen(0);

	//Init main loop
	requestAnimationFrame(mainLoop);
}


/*--------------------------------------------------------FONT--------------------------------------------------*/
var fontBitmap = "./asteroidGame/spaceFont.png";
var fontwidth = 15;
var bitmapWidth = 128;


var fontMap = {
	"A" : {x : 0, y: 0},
	"B" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: 0},
	"C" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: 0},
	"D" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: 0},
	"E" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: 0},
	"F" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: 0},
	"G" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: 0},
	"H" : {x : 0, y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"I" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"J" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"K" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"L" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"M" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"N" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 4)  * 1) / bitmapWidth)},
	"O" : {x : 0, y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"P" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"Q" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"R" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"S" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"T" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"U" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 4)  * 2) / bitmapWidth)},
	"V" : {x : 0, y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"W" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"X" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"Y" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"Z" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"1" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"2" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 4)  * 3) / bitmapWidth)},
	"3" : {x : 0, y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"4" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"5" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"6" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"7" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"8" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"9" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 4)  * 4) / bitmapWidth)},
	"0" : {x : 0, y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"." : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"-" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"," : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	";" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"+" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"-" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 4)  * 5) / bitmapWidth)},
	"!" : {x : 0, y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
	"&" : {x : (((fontwidth + 2)  * 1) / bitmapWidth), y: -(((fontwidth + 3.8)  * 6) / bitmapWidth)},
	"$" : {x : (((fontwidth + 2)  * 2) / bitmapWidth), y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
	"%" : {x : (((fontwidth + 2)  * 3) / bitmapWidth), y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
	"/" : {x : (((fontwidth + 2)  * 4) / bitmapWidth), y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
	"(" : {x : (((fontwidth + 2)  * 5) / bitmapWidth), y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
	")" : {x : (((fontwidth + 2)  * 6) / bitmapWidth), y: -(((fontwidth + 2)  * 6) / bitmapWidth)},
};

function loadImageAndCreateTexture(url) {
  var tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
				
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
 
  var img = new Image();
  img.onload = function() {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  };
  
  img.src = url;

  return tex;
}

/*Shader for GUI textured elements (TEXT)*/  
const vertexTextureGUIShaderSource = `
    attribute vec2 aVertexPosition;
	attribute vec2 aTexcoord;
	
	uniform mat3 uModel;
	
	varying vec2 vTexcoord;

    void main() {
	  vec3 pos = vec3(aVertexPosition, 1.0);
	 
	  pos = uModel * pos;
	  
	  //Put vertex position on normalized openGL screen (from 640/480 screen)
	  pos = vec3(((pos.x / 640.0) * 2.0) - 1.0, (pos.y / 480.0) * 2.0 - 1.0, 1.0);
	  
      gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
	  vTexcoord = aTexcoord;
    }
  `;

const fragmentTextureGUIShaderSource = `
	precision mediump float;
	
	varying vec2 vTexcoord;
	
	uniform vec4 uColor;
	uniform sampler2D uTexture;

	uniform vec2 uTranslateTexcoord;
	
    void main() {
      vec4 colorTexture = texture2D(uTexture, vTexcoord + uTranslateTexcoord);
      gl_FragColor = vec4(colorTexture.rgb + uColor.rgb, colorTexture.a * uColor.a);
    }
  `;

var shaderFont = null;

//ShaderProgram attributes and uniforms
var vertexPositionText = null;
var texcoordPositionText = null;
var modelPositionText = null;

var colorPositionText = null;
var translateTexcoord = null;

  
/*Rectangle Model*/
var vertices = new Float32Array([
		//Vertex positions		//TexturePositions
	   -1.0,  1.0, 				0.0, 						1.0,
	    1.0, -1.0, 				(fontwidth/bitmapWidth), 	1 - (fontwidth/bitmapWidth),
	   -1.0, -1.0, 				0.0, 						1 - (fontwidth/bitmapWidth),
		
	   -1.0,  1.0, 				0.0,						1.0,
	    1.0,  1.0,				(fontwidth/bitmapWidth),	1.0,
	    1.0, -1.0,				(fontwidth/bitmapWidth),	1 - (fontwidth/bitmapWidth)
]);
	
//Set vertexBuffer
var vertexBufferText = null;
var fontTexture = null;


function drawTextTexture(_posX, _posY, _scaleX, _scaleY, _text, _color){
	gl.useProgram(shaderFont);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferText);
	gl.vertexAttribPointer(vertexPositionText, 2, gl.FLOAT, false, 4 * 4, 0);
	gl.enableVertexAttribArray(vertexPositionText);
	gl.vertexAttribPointer(texcoordPositionText, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
	gl.enableVertexAttribArray(texcoordPositionText);


	gl.uniform4f(colorPositionText, _color.r,_color.g,_color.b, _color.a);

	for(let i = 0; i < _text.length; i++){
		let character = _text.charAt(i);
		if(character == ' ') continue;

		let letterMapping = fontMap[character];
		var space = _scaleX / 4.0;
		gl.uniformMatrix3fv(modelPositionText, false, getScaleTranslationMatrix3X3((_posX + (_scaleX * 2) * i + space * i), _posY, _scaleX, _scaleY));
		gl.uniform2f(translateTexcoord, letterMapping.x, letterMapping.y);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
	
}
/*-------------------------------------------------------------------------------------------------------------*/

/*-------------------------------Create frameBuffer for post processing----------------------------------------*/

var framebuffer = null;


/*------------------------------Basic Shader-----------------------*/
const vertexShaderSource = `
    attribute vec2 aVertexPosition;
	
    uniform vec2 uResolution;

	uniform mat3 uModel;
	uniform mat3 uProj;
	uniform mat3 uCamera;
	
    void main() {
	  vec3 pos = vec3(aVertexPosition, 1.0);
	 
	  pos = uCamera * uModel * pos;
	  
	  //Put vertex position on normalized openGL screen (from 640/480 screen)
	  pos = vec3(((pos.x / uResolution.x) * 2.0) - 1.0, (pos.y / uResolution.y) * 2.0 - 1.0, 1.0);
	  
      gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
    }
  `;

const fragmentShaderSource = `
	precision mediump float;
	
	uniform vec4 uColor;
	
    void main() {
      gl_FragColor = vec4(uColor);
    }
  `;

var shaderProgram = null;

//shaderProgram attributes and uniforms
var vertexPosition = null;
var modelPosition = null;
var projectionPosition = null;
var cameraPosition = null;

var resolutionPosition = null;
var colorPosition = null;

/*------------------------------INPUT------------------------------*/
var currentlyPressedKeys = {};
var pressedKeys = {};

function handleKeyDown(event){
	currentlyPressedKeys[event.keyCode] = true;
	pressedKeys[event.keyCode] = true;
}

function handleKeyUp(event){
	currentlyPressedKeys[event.keyCode] = false;
}

//Input handles
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;


var timeBefore = 0.0;
var dt = 0.0; //deltaTime

//Screens
var screenStack = [];

//User
//var username = null;
var username = 'anonymous'; //Hardcoded


//Fases
var fases = null;

//Logros
var logros = null;
var logrosUser = null;

var pauseMenu = false;
var reanudarSelect = true;



function mainLoop(_timeNow){
	//Time
	dt = (_timeNow - timeBefore) / 1000.0;
    timeBefore = _timeNow;
	
	//pause button+
	if(pressedKeys[27]){
		if(pauseMenu){
			//music.play();
		}else{
			//music.pause();
		}
		pauseMenu = !pauseMenu;
	}
    
	//Pause
	if(!pauseMenu){
		if(screenStack.length > 0){
			screenStack[screenStack.length - 1].handleInput();

			//Attach framebuffer
			framebuffer.update(dt);
			framebuffer.bind(gl);
			gl.bindTexture(gl.TEXTURE_2D, fontTexture);
			screenStack[screenStack.length - 1].mainLoop(dt, gl, framebuffer);
			framebuffer.unbind(gl);


			framebuffer.draw(gl);
		}
	}else{
		//draw pause menu and update
		//Update
		//UP & DOWN
		if(pressedKeys[87] || pressedKeys[38] || pressedKeys[83] || pressedKeys[40]){
			reanudarSelect = !reanudarSelect;
		}
		
		//ENTER
		if(currentlyPressedKeys[32] || currentlyPressedKeys[13]){
			if(reanudarSelect){
				pauseMenu = false;
			}else{
				window.location = "/";
			}
		}
		
		//Draw
		gl.bindTexture(gl.TEXTURE_2D, fontTexture);
		gl.enable(gl.BLEND);
		if(reanudarSelect){
			drawTextTexture(200, 300, 16.0, 16.0, "REANUDAR", {"r" : 1.0, "g" : 1.0, "b" : 0.0, "a" : 1.0});
			drawTextTexture(270, 200, 16.0, 16.0, "EXIT", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
		}else{
			drawTextTexture(200, 300, 16.0, 16.0, "REANUDAR", {"r" : 1.0, "g" : 1.0, "b" : 1.0, "a" : 1.0});
			drawTextTexture(270, 200, 16.0, 16.0, "EXIT", {"r" : 1.0, "g" : 1.0, "b" : 0.0, "a" : 1.0});
		}
		
		gl.disable(gl.BLEND);
	}

	//Handle pressedKeys to false
    for(var key in pressedKeys) {
    	pressedKeys[key] = false;
	}

	requestAnimationFrame(mainLoop);
}

function resize(){
	if(screenStack.length > 0){
		screenStack[screenStack.length - 1].resize();
	}
}

function popScreen(){
	screenStack[screenStack.length - 1].onremove();
	screenStack[screenStack.length - 1] = null;
	screenStack.pop();
}

function addScreen(_screen){
	switch(_screen){
		case START_SCREEN:
			screenStack.push(new StartScreen(addScreen, popScreen));
		break;
		case GAME_SCREEN:
			screenStack.push(new GameScreen(addScreen, popScreen));
		break;
		case LOAD_SCREEN:
			screenStack.push(new LoadScreen(addScreen, popScreen));
		break;
	}
}

/*Hardcoded
window.addEventListener("resize", function(evt){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	gl.viewport(0,0, canvasWidth,canvasHeight);
	gl.scissor(0, 0, canvasWidth, canvasHeight);
	gl.useProgram(shaderProgram);
	gl.uniform2f(resolutionPosition, canvasWidth, canvasHeight);

	resize();

	framebuffer.resize(gl, canvasWidth, canvasHeight);

});
*/

