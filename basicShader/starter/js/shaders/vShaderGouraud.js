/**
 * @file Gouraud vertex shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.2) and (2.1.3) */

var shaderID = "vShaderGouraud";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {
	vec3 diffuseSum = vec3(0,0,0);
	vec3 specularSum = vec3(0,0,0);
	vec3 ambientReflection = material.ambient * ambientLightColor;

	for(int i = 0; i < NUM_POINT_LIGHTS; i++){
		// Compute ambient reflection

		//convert normal to view space by multiplying it by the 3x3 normal mat3
		vec3 convertedNormal = normalMat* normal;

		//get cos theta ie Li * N
		float cosTheta = dot(normalize(pointLights[i].position), convertedNormal);

		//calculate light and cos portion then calulate all together
		vec3 LdiffuseCos = pointLights[i].color * cosTheta;

		//summed
		diffuseSum += material.diffuse * LdiffuseCos * max(cosTheta, 0.0);

		//--------------------Reflection----------------------//
		vec3 vPosition = (modelViewMat * vec4(position, 1.0)).xyz;
		vec3 vNormal = mat3(modelViewMat) * normal;
		vec3 LV = pointLights[i].position - vPosition;
		vec3 ViewV = -vPosition;

		vNormal = normalize(vNormal);
		LV = normalize(LV);
		ViewV = normalize(ViewV);

		vec3 R = reflect(-LV, vNormal);

		//summed
		specularSum += pow(max(dot(R, LV), 0.0), material.shininess) * material.specular;
	}

	vColor = ambientReflection + diffuseSum + specularSum;

	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );
}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
