// --- Uniforms passed from JavaScript ---
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float uLightRadius;
uniform float u_blendFactor;
uniform float uScreenScale; // New uniform for screen size scaling

// --- Noise and FBM Functions ---
float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 f = fract(p);
    f = f * f * f * f * (3. - 2. * f) * (3. - 2. * f);
    vec2 i = floor(p);
    return mix(mix(rand(i + vec2(0, 0)), rand(i + vec2(1, 0)), f.x),
               mix(rand(i + vec2(0, 1)), rand(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 1.0;
    for(int i = 0; i < 6; ++i) {
        p = 1.5 * p + 15.0;
        a *= 0.5;
        v += a * noise(p);
    }
    return v;
}

float getWaveHeight(vec2 p) {
    // Scale the wave frequency based on screen size
    float waveScale = uScreenScale;
    vec2 scaledP = p * waveScale;
    
    vec2 r1 = vec2(fbm(scaledP + 0.02 * iTime), fbm(scaledP + 0.005 * iTime));
    vec2 r2 = vec2(fbm(scaledP + 0.15 * iTime + 10. * r1), fbm(scaledP + 0.12 * iTime + 12. * r1));
    float foregroundWaves = fbm(scaledP + r2);
    float backgroundWaves = fbm(scaledP * 0.7 + iTime * 0.02);
    return mix(foregroundWaves, backgroundWaves, 0.4);
}

void main() {
    // Use normalized coordinates across the entire bento grid
    vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec2 mouse = (2.0 * iMouse.xy * iResolution.xy - iResolution.xy) / iResolution.y;

    // Calculate wave height and lighting
    float centerHeight = getWaveHeight(p);
    float eps = 0.01; 
    vec2 grad = vec2(
        getWaveHeight(p + vec2(eps, 0.0)) - centerHeight, 
        getWaveHeight(p + vec2(0.0, eps)) - centerHeight
    );
    vec3 normal = normalize(vec3(-grad.x, -grad.y, eps));
    
    // Lighting calculation with screen-size dependent radius
    vec3 lightPos = vec3(mouse.xy, 0.1); 
    vec3 lightDir = normalize(lightPos - vec3(p, centerHeight));
    float diffuse = max(0.0, dot(normal, lightDir));
    float mouseDist = distance(lightPos.xy, p);
    
    // Scale light radius based on screen size
    float scaledLightRadius = uLightRadius * uScreenScale;
    float attenuation = 1.0 / (1.0 + mouseDist * mouseDist * scaledLightRadius);
    float waveLighting = diffuse * attenuation * 0.3; 
    float airGlow = 0.2 / (1.0 + mouseDist * mouseDist * (scaledLightRadius * 2.0));
    
    // Base wave color calculation - GRAYSCALE ONLY
    float baseValue = getWaveHeight(p);
    float brightnessValue = 1.5 * pow(baseValue, 2.0) + 0.01;
    vec3 darkestColor = vec3(0.25);
    vec3 lightestColor = vec3(0.7);
    float t = smoothstep(0.0, 1.5, brightnessValue);
    vec3 grayscaleColor = mix(darkestColor, lightestColor, t);
    grayscaleColor += waveLighting;
    grayscaleColor += airGlow;
    
    // Keep it pure grayscale - no color variation
    vec3 finalColor = grayscaleColor;

    gl_FragColor = vec4(finalColor, 1.0);
}