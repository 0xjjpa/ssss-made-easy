import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { copyCanvasToClipboard } from '../lib/clipboard-utils';

interface Props {
  value: string;
  className?: string;
  width?: number;
  margin?: number;
  onCopy?: () => void;
  onError?: (message: string) => void;
}

function QrCode({ value, className, width = 320, margin = 4, onCopy, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, { width, margin, errorCorrectionLevel: 'high' }, (err) => {
      if (err && onError) {
        onError(String(err));
      }
    });
  }, [value, width, margin, onError]);

  const handleCopy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    copyCanvasToClipboard(canvas, (err) => {
      if (err && onError) {
        onError(String(err));
      } else if (!err && onCopy) {
        onCopy();
      }
    });
  };

  return <canvas ref={canvasRef} className={className} width={width * 2} height={width * 2} onClick={handleCopy} />;
}

export default QrCode;
