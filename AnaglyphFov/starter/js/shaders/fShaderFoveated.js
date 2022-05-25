/**
 * @file Fragment shader for foveated rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.4) Fragment Shader Foveation Blur */

var shaderID = "fShaderFoveated";

var shader = document.createTextNode( `
/***
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// texture or uv coordinates of current fragment in normalized coordinates [0,1]
varying vec2 textureCoords;

// texture map from the first rendering pass
uniform sampler2D textureMap;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// window space coordinates of gaze position in [pixels]
uniform vec2 gazePosition;

// eccentricity angle at boundary of foveal and middle layers
uniform float e1;

// eccentricity angle at boundary of middle and outer layers
uniform float e2;

// visual angle of one pixel
uniform float pixelVA;

// radius of middle layer blur kernel [in pixels]
const float middleKernelRad = 2.0;

// radius of outer layer blur kernel [in pixels]
const float outerKernelRad = 4.0;

// gaussian blur kernel for middle layer (5x5)
uniform float middleBlurKernel[int(middleKernelRad)*2+1];

// gaussian blur kernel for outer layer (9x9)
uniform float outerBlurKernel[int(outerKernelRad)*2+1];



void main() {
	//uniformMatrix3fv(testBlurKernel, false, gaussian);
	vec2 delta = 1.0/windowSize;                                     
    vec4 color = vec4(0,0,0,0); 
	//mat3 gaussian = mat3(0.1625, 0.1225, 0.06225, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625);
	mat3 gaussian_inner = mat3(0.1019, 0.1154, 0.1019, 0.1154, 0.1308, 0.1154, 0.1019, 0.1154, 0.1019);
	//mat3 gaussian_outer = mat3(0.1088, 0.1123, 0.1088, 0.1123, 0.1158, 0.1123, 0.1088, 0.1123, 0.1088);
	mat3 gaussian_outer = mat3(0.0673,0.1248,0.0673,0.1248,0.2314,0.1248,0.0673,0.1248,0.0673);
		
	//outer gaussian		
	if(distance((gazePosition/windowSize), textureCoords) - (e1) > 0.0){
		for (int i=0; i<=2; i++) {                                      
			for (int j=0; j<=2; j++) {                                 
				vec2 offset = textureCoords + vec2(i-1, j-1)*delta;            
				color += gaussian_outer[i][j]*texture2D(textureMap, textureCoords);  
			
			}                                                           
		} 
		//gl_FragColor = vec4(1,0,0,1);
		//return;
	}
	//inner gaussian
	else if(distance((gazePosition/windowSize), textureCoords) - (e2) > 0.0){
		for (int i=0; i<=2; i++) {                                      
			for (int j=0; j<=2; j++) {                                 
				vec2 offset = textureCoords + vec2(i-1, j-1)*delta;            
				color += gaussian_inner[i][j]*texture2D(textureMap, offset);  
			}                                                           
		} 
	}
	else{
		gl_FragColor = texture2D( textureMap,  textureCoords );
		//gl_FragColor = vec4(1,0,0,1);
		return;
	}

	
	                                                              
    gl_FragColor = color; 
}
` );

var gaussian = new Float32Array([0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625]);	

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
