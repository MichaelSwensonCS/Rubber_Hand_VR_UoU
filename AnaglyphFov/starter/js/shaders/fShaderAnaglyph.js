/**
 * @file Fragment shader for anaglyph rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.4.3) Color Channel Multiplexing */

var shaderID = "fShaderAnaglyph";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// Texture map for the left eye
uniform sampler2D textureMapL;

// Texture map for the right eye
uniform sampler2D textureMapR;

void main() {
	vec4 grey_scale = vec4(.2989, .5870, .1140, 1.0);
	vec4 color_l = grey_scale * texture2D( textureMapL,  textureCoords );
	float grey_l = color_l.x + color_l.y + color_l.z;
	
	vec4 color_r = grey_scale * texture2D( textureMapR,  textureCoords );
	float grey_r = color_r.x + color_r.y + color_r.z;
	
	gl_FragColor = vec4(grey_l,grey_r,grey_r,1.0);

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
