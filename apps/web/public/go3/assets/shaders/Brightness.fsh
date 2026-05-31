#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;	
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main(void)
{
	vec4 col = texture2D(u_texture, v_texCoord);
	
	vec3 col2 = mix(col.rgb, vec3(1.0,1.0,1.0)*col.a, 0.25);
	
	gl_FragColor = vec4(col2, col.a);
}