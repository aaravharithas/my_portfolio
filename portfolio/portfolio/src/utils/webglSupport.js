/**
 * WebGL Support Detection Utility
 * Checks if WebGL is supported and provides fallback information
 */

export function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        supported: false,
        webgl: false,
        webgl2: false,
        message: 'WebGL is not supported in this browser'
      };
    }
    
    const webgl2 = !!canvas.getContext('webgl2');
    
    return {
      supported: true,
      webgl: true,
      webgl2,
      message: webgl2 ? 'WebGL 2.0 supported' : 'WebGL 1.0 supported'
    };
  } catch (e) {
    return {
      supported: false,
      webgl: false,
      webgl2: false,
      message: `WebGL check failed: ${e.message}`
    };
  }
}

export function isWebGLSupported() {
  return checkWebGLSupport().supported;
}
