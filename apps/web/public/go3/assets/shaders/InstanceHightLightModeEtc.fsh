#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texture;	
varying vec2 v_texCoord;
uniform float SpriteOpacity;
varying vec4 v_fragmentColor;
uniform sampler2D u_alphaTexture;

void main(void)
{
	vec4 col = texture2D(u_texture, v_texCoord);
	float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
	float opacity = SpriteOpacity;
	col.a = texture2D(u_alphaTexture, v_texCoord).a;
	gray = gray*col.a;
	gl_FragColor = vec4(gray *opacity, gray *opacity, col.a *opacity*0.7, col.a * opacity);
}