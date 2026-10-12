import type { Area } from 'react-easy-crop';

const MAX_EDGE = 1024;

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () =>
      reject(
        new Error("This image can't be edited. Upload a PNG or JPG instead."),
      ),
    );
    if (/^https?:/i.test(src)) {
      image.crossOrigin = 'anonymous';
    }
    image.src = src;
  });
}

function getRadianAngle(degree: number) {
  return (degree * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export function isSvgImageSource(src: string): boolean {
  const value = src.trim().toLowerCase();
  if (!value) return false;
  if (value.startsWith('data:image/svg')) return true;
  if (value.includes('image/svg+xml')) return true;
  const path = value.split('?')[0].split('#')[0];
  return path.endsWith('.svg');
}

export async function canEditImageSource(src: string): Promise<boolean> {
  if (!src || isSvgImageSource(src)) return false;
  try {
    const image = await createImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) return false;
    context.drawImage(image, 0, 0, 1, 1);
    canvas.toDataURL('image/png');
    return image.naturalWidth > 0 && image.naturalHeight > 0;
  } catch {
    return false;
  }
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to edit this image.');
  }

  const rotRad = getRadianAngle(rotation);
  const { width: boxWidth, height: boxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );

  canvas.width = boxWidth;
  canvas.height = boxHeight;

  context.translate(boxWidth / 2, boxHeight / 2);
  context.rotate(rotRad);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const cropWidth = Math.max(1, pixelCrop.width);
  const cropHeight = Math.max(1, pixelCrop.height);
  const scale = Math.min(1, MAX_EDGE / Math.max(cropWidth, cropHeight));
  const outputWidth = Math.max(1, Math.round(cropWidth * scale));
  const outputHeight = Math.max(1, Math.round(cropHeight * scale));

  const croppedCanvas = document.createElement('canvas');
  const croppedContext = croppedCanvas.getContext('2d');
  if (!croppedContext) {
    throw new Error('Unable to edit this image.');
  }
  croppedCanvas.width = outputWidth;
  croppedCanvas.height = outputHeight;
  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  try {
    return croppedCanvas.toDataURL('image/png');
  } catch {
    throw new Error("This image can't be edited. Upload a PNG or JPG instead.");
  }
}
