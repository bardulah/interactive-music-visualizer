export interface CustomShader {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  createdAt: number;
}

export const defaultShaders: CustomShader[] = [
  {
    id: 'default-wave',
    name: 'Audio Wave',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_time;
      uniform float u_bass;
      uniform float u_mid;
      uniform float u_treble;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        // Create wave pattern
        float wave = sin(uv.x * 10.0 + u_time) * 0.1;
        wave += sin(uv.y * 8.0 - u_time * 0.5) * 0.1;

        // Add audio reactivity
        wave += u_bass * 0.3;

        // Calculate distance from center
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(uv, center);

        // Create color gradient
        vec3 color = mix(u_color1, u_color2, dist + wave);

        // Add glow based on audio
        color += vec3(u_mid * 0.5, u_treble * 0.3, u_bass * 0.4);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    createdAt: Date.now(),
  },
  {
    id: 'default-frequency',
    name: 'Frequency Rings',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_time;
      uniform float u_bass;
      uniform float u_mid;
      uniform float u_treble;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);

        // Create rings
        float rings = sin(dist * 20.0 - u_time * 2.0) * 0.5 + 0.5;

        // Add audio reactivity to ring frequency
        rings = sin(dist * (20.0 + u_bass * 10.0) - u_time * 2.0) * 0.5 + 0.5;

        // Color based on frequency bands
        vec3 color = vec3(0.0);
        color.r = u_bass * rings;
        color.g = u_mid * rings;
        color.b = u_treble * rings;

        // Add gradient
        color = mix(color, u_color1, 0.3);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    createdAt: Date.now(),
  },
  {
    id: 'default-plasma',
    name: 'Plasma',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float u_time;
      uniform float u_bass;
      uniform float u_mid;
      uniform float u_treble;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        float speed = u_time * (0.5 + u_bass * 0.5);

        // Plasma effect
        float v1 = sin(uv.x * 10.0 + speed);
        float v2 = sin(10.0 * (uv.x * sin(speed / 2.0) + uv.y * cos(speed / 3.0)) + speed);
        float cx = uv.x + 0.5 * sin(speed / 5.0);
        float cy = uv.y + 0.5 * cos(speed / 3.0);
        float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + speed);

        float value = (v1 + v2 + v3) / 3.0;

        // Color mapping with audio
        vec3 color = vec3(
          0.5 + 0.5 * sin(value * 3.14159 + u_bass),
          0.5 + 0.5 * sin(value * 3.14159 + u_mid + 2.0),
          0.5 + 0.5 * sin(value * 3.14159 + u_treble + 4.0)
        );

        // Mix with theme colors
        color = mix(color, u_color1, 0.2);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    createdAt: Date.now(),
  },
];

export class ShaderManager {
  private static readonly STORAGE_KEY = 'custom-shaders';

  static saveShader(shader: CustomShader): void {
    const shaders = this.getAllShaders();
    const existing = shaders.findIndex(s => s.id === shader.id);

    if (existing >= 0) {
      shaders[existing] = shader;
    } else {
      shaders.push(shader);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shaders));
  }

  static getAllShaders(): CustomShader[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const customShaders = stored ? JSON.parse(stored) : [];
    return [...defaultShaders, ...customShaders];
  }

  static getShader(id: string): CustomShader | null {
    const shaders = this.getAllShaders();
    return shaders.find(s => s.id === id) || null;
  }

  static deleteShader(id: string): void {
    const shaders = this.getAllShaders().filter(s => s.id !== id && !s.id.startsWith('default-'));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shaders.filter(s => !s.id.startsWith('default-'))));
  }

  static validateShader(vertexShader: string, fragmentShader: string): { valid: boolean; error?: string } {
    // Basic validation - check for required elements
    if (!vertexShader.includes('gl_Position')) {
      return { valid: false, error: 'Vertex shader must set gl_Position' };
    }

    if (!fragmentShader.includes('gl_FragColor')) {
      return { valid: false, error: 'Fragment shader must set gl_FragColor' };
    }

    // Check for common syntax errors
    const forbiddenKeywords = ['import', 'require', 'eval'];
    const allCode = vertexShader + fragmentShader;

    for (const keyword of forbiddenKeywords) {
      if (allCode.includes(keyword)) {
        return { valid: false, error: `Forbidden keyword: ${keyword}` };
      }
    }

    return { valid: true };
  }

  static createTemplate(): CustomShader {
    return {
      id: `custom-${Date.now()}`,
      name: 'My Custom Shader',
      vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
      `.trim(),
      fragmentShader: `
uniform float u_time;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform vec3 u_color1;
uniform vec3 u_color2;
varying vec2 vUv;

void main() {
  // Your shader code here
  vec2 uv = vUv;

  // Example: Simple gradient with audio
  vec3 color = mix(u_color1, u_color2, uv.x + u_bass * 0.2);

  gl_FragColor = vec4(color, 1.0);
}
      `.trim(),
      createdAt: Date.now(),
    };
  }
}
