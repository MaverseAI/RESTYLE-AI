export const getOrientedImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
};

export const cropImage = async (imageUrl: string, ratio: string): Promise<string> => {
  // Simple pass-through if cropping isn't strictly required or complex.
  // Implementing a basic canvas crop based on ratio string "W:H"
  try {
    const [wRatio, hRatio] = ratio.split(':').map(Number);
    if (!wRatio || !hRatio) return imageUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    const targetRatio = wRatio / hRatio;
    const currentRatio = img.width / img.height;

    let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

    if (currentRatio > targetRatio) {
      // Image is wider than target
      srcW = img.height * targetRatio;
      srcX = (img.width - srcW) / 2;
    } else {
      // Image is taller than target
      srcH = img.width / targetRatio;
      srcY = (img.height - srcH) / 2;
    }

    canvas.width = srcW;
    canvas.height = srcH;
    
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error("Crop failed", e);
    return imageUrl;
  }
};