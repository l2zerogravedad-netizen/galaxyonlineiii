#ifdef GL_ES
precision lowp float;
#endif

varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
uniform sampler2D CC_Texture0;
uniform sampler2D u_alphaTexture;

void main()
{
	vec4 color = vec4(0.0);
	color   =  texture2D(CC_Texture0, v_texCoord);
	color.a =  texture2D(u_alphaTexture, v_texCoord).a;
	color.rgb = v_fragmentColor.rgb * color.rgb;	
	float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor = vec4(gray, gray, gray, color.a);
}