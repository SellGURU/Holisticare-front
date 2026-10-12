import { FC, useCallback, useEffect, useState } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import SpinnerLoader from '../../../Components/SpinnerLoader';
import { Slider } from '../../../Components/ui/slider';
import { getCroppedImage } from './getCroppedImage';

interface ImageCropModalProps {
  imageSrc: string;
  title: string;
  aspectMode: 'free' | 'square';
  onCancel: () => void;
  onApply: (dataUrl: string) => void;
}

const ImageCropModal: FC<ImageCropModalProps> = ({
  imageSrc,
  title,
  aspectMode,
  onCancel,
  onApply,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [naturalAspect, setNaturalAspect] = useState(1);
  const [ready, setReady] = useState(aspectMode === 'square');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (aspectMode === 'square') {
      setNaturalAspect(1);
      setReady(true);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const ratio =
        image.naturalWidth > 0 && image.naturalHeight > 0
          ? image.naturalWidth / image.naturalHeight
          : 1;
      setNaturalAspect(ratio);
      setReady(true);
    };
    image.onerror = () => {
      if (cancelled) return;
      setError("This image can't be edited. Upload a PNG or JPG instead.");
    };
    if (/^https?:/i.test(imageSrc)) {
      image.crossOrigin = 'anonymous';
    }
    image.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [aspectMode, imageSrc]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !applying) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applying, onCancel]);

  const aspect = aspectMode === 'square' ? 1 : naturalAspect;

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError('');
  };

  const apply = async () => {
    if (!croppedAreaPixels || applying) return;
    setApplying(true);
    setError('');
    try {
      const dataUrl = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
        rotation,
      );
      onApply(dataUrl);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : 'Unable to edit this image.',
      );
      setApplying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      role="presentation"
      onClick={() => {
        if (!applying) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-Gray-50 bg-white shadow-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-Gray-50 px-5 py-4">
          <h2
            id="image-crop-title"
            className="text-base font-semibold text-Text-Primary"
          >
            {title}
          </h2>
          <p className="mt-1 text-[11px] text-Text-Quadruple">
            Drag to reposition. Zoom and rotate, then apply.
          </p>
        </div>
        <div className="relative h-[320px] bg-[#111827]">
          {ready && !error ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              minZoom={1}
              maxZoom={3}
              showGrid
              mediaProps={
                /^https?:/i.test(imageSrc)
                  ? { crossOrigin: 'anonymous' }
                  : undefined
              }
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {error ? null : <SpinnerLoader color="#ffffff" />}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 px-5 py-4">
          <label className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-medium text-Text-Primary">
              Zoom
            </span>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              disabled={!ready || !!error || applying}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
              aria-label="Zoom"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-Text-Primary">
              Rotate
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!ready || !!error || applying}
                className="rounded-lg border border-Gray-50 bg-white px-3 py-1.5 text-xs font-medium text-Text-Primary hover:bg-backgroundColor-Main disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setRotation((current) => (current + 90) % 360)}
              >
                Rotate 90°
              </button>
              <button
                type="button"
                disabled={applying}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-Text-Quadruple hover:bg-backgroundColor-Main disabled:cursor-not-allowed disabled:opacity-50"
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>
          {error && <div className="text-[11px] text-Red">{error}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-Gray-50 px-5 py-4">
          <button
            type="button"
            disabled={applying}
            className="rounded-lg px-4 py-2 text-xs font-medium text-Text-Quadruple hover:bg-backgroundColor-Main disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || !!error || applying || !croppedAreaPixels}
            className="flex min-w-[88px] items-center justify-center rounded-lg bg-Primary-DeepTeal px-4 py-2 text-xs font-medium text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={apply}
          >
            {applying ? <SpinnerLoader color="#ffffff" /> : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
