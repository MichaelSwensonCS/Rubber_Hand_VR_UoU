/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Compute the distance to fragment in [mm]
// p: texture coordinate of a fragment / a gaze position
//
// Note: GLSL is column major
float distToFrag( vec2 p ) {

	/* TODO (2.3.1) Distance to Fragment */
	vec3 vec_ndc = 2.0*vec3(texture2D(textureMap,p).x,texture2D(textureMap,p).y,texture2D(depthMap,p)) - 1.0;
	vec4 vec4_ndc = vec4(vec_ndc, 1.0);
	//Column first
	float w_clip = projectionMat[3][2] / (vec4_ndc.z - (projectionMat[2][2] / projectionMat[2][3]));
	vec4 vec4_clip = vec4_ndc * w_clip;
	vec4 vec4_camera = invProjectionMat * vec4_clip;

	float distance_to_frag = sqrt(pow(vec4_camera.x,2.0)+ pow(vec4_camera.y,2.0)+ pow(vec4_camera.z,2.0) );

	return distance_to_frag;

}


// compute the circle of confusion in [mm]
// fragDist: distance to current fragment in [mm]
// focusDist: distance to focus plane in [mm]
float computeCoC( float fragDist, float focusDist ) {

	/* TODO (2.3.2) Circle of Confusion Computation */
	//f = ?? from the slides
	float f = 17.0;
	float s1 = focusDist;
	float s = fragDist;
	float D = pupilDiameter;
	float M = f / (s1 - f);
	
	float c = D*abs(s - s1)/s;

	return c;
}


// compute depth of field blur and return color at current fragment
vec3 computeBlur() {
  float dist = distToFrag(textureCoords);
  float focusDist = distToFrag(gazePosition/windowSize);
float circle_of_confusion = computeCoC(dist,focusDist);
  float blurRadius = 0.5*circle_of_confusion/pixelPitch;

  float average = 0.0;
  vec4 colourVec = vec4(0.0,0.0,0.0,0.0);
  for (int i = -int(searchRad); i < int(searchRad)+1; i++) {
    for (int j = -int(searchRad); j < int(searchRad)+1; j++) {
      if (blurRadius * blurRadius > float(i)*float(i)+float(j)*float(j)) {
        colourVec += texture2D(textureMap,textureCoords+vec2(float(i)/windowSize.x, float(j)/windowSize.y));
        average++;
      }
    }
  }
  return colourVec.xyz/average;
// return vec3( 0.0 );
}


void main() {

	gl_FragColor.rgb = computeBlur();// texture2D( textureMap,  textureCoords );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
