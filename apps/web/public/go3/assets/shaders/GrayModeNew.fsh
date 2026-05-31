#ifdef GL_ES
precision mediump float;
#endif
	uniform sampler2D u_texture;
	varying vec2 v_texCoord;
	varying vec4 v_fragmentColor;
	uniform float SpriteOpacity;
void main(void)
{
	// Convert to grayscale using NTSC weightings
	vec4 col = texture2D(u_texture, v_texCoord);
	float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
	float opacity = SpriteOpacity;
	gl_FragColor = vec4(gray*opacity, gray*opacity, gray*opacity, col.a*opacity);
}