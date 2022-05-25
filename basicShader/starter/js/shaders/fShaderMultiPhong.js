/**
 * @file Phong fragment shader with point and directional lights
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.3) */

var shaderID = "fShaderMultiPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

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

/***
 * NUM_DIR_LIGHTS is replaced to the number of directional lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

#endif


void main() {
	vec3 diffuseSum = vec3(0,0,0);
	vec3 specularSum = vec3(0,0,0);
	vec3 directionalSum = vec3(0,0,0);
	vec3 ambientReflection = material.ambient * ambientLightColor;


	for(int i = 0; i < NUM_DIR_LIGHTS; i++){
		 //compute cosine of the directions, using dot products,
		vec3 vPosition = (viewMat * vec4(fragPosCam, 1.0)).xyz;
		vec3 vNormal = mat3(viewMat) * normalize(normalCam);

		//fix
		vec3 LV = directionalLights[i].direction - vPosition;
		vec3 ViewV = -vPosition;

		vNormal = normalize(vNormal);
		LV = normalize(LV);

		vec3 R = reflect(-LV, vNormal);

		float diffuse = max(0.0, dot(vNormal, directionalLights[i].direction));
		float specular = max(0.0, dot(vNormal, R));

		specular = pow(specular, material.shininess);

		vec3 scatteredLight = material.ambient + directionalLights[i].color * diffuse;
		vec3 reflectedLight = directionalLights[i].color * specular * material.specular;

		directionalSum += min(directionalLights[i].color * scatteredLight + reflectedLight, vec3(1.0));
	}


	for(int i = 0; i < NUM_POINT_LIGHTS; i++){
		// Compute ambient reflection

		//convert normal to view space by multiplying it by the 3x3 normal mat3
		vec3 convertedNormal = normalize(normalCam);

		//get cos theta ie Li * N
		float cosTheta = dot(normalize(pointLights[i].position), convertedNormal);

		//calculate light and cos portion then calulate all together
		vec3 LdiffuseCos = pointLights[i].color * cosTheta;

		//summed
		diffuseSum += material.diffuse * LdiffuseCos * max(cosTheta, 0.0) ;

		//--------------------Reflection----------------------//

		//This part maybe, no transforms in fragment
		vec3 vPosition = (viewMat * vec4(fragPosCam, 1.0)).xyz;


		vec3 vNormal = mat3(viewMat) * normalize(normalCam);
		vec3 LV = pointLights[i].position - vPosition;
		vec3 ViewV = -vPosition;

		vNormal = normalize(vNormal);
		LV = normalize(LV);
		//ViewV = normalize(ViewV);

		vec3 R = reflect(-LV, vNormal);

		//summed
		specularSum += pow(max(dot(R, LV), 0.0), material.shininess) * material.specular;
	}

	vec3 fColor = ambientReflection + diffuseSum + specularSum + directionalSum;

	gl_FragColor = vec4( fColor, 1.0 );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
