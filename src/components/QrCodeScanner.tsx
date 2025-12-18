import { useEffect, useRef } from 'react';
import { Html5QrcodeScanType, Html5QrcodeScanner, type Html5QrcodeResult } from 'html5-qrcode';
import RoundButton from './RoundButton';

interface Props {
  onClose: () => void;
  onScanSuccess: (result: Html5QrcodeResult) => void;
}

function QrCodeScanner({ onClose, onScanSuccess }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qrcode-reader',
      {
        rememberLastUsedCamera: true,
        fps: 3,
        aspectRatio: 1,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE],
      },
      false,
    );
    scannerRef.current = scanner;
    scanner.render((decodedText, result) => onScanSuccess(result), () => {});
    return () => {
      scanner.clear().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="rounded-3xl m-auto sm:w-[512px] w-[360px] sm:h-[530px] h-[530px] bg-white text-black border border-solid flex flex-col items-center relative">
        <div className="w-[320px] h-[430px] bg-slate-100 mt-3 mx-auto" id="qrcode-reader"></div>
        <div className="absolute bottom-5 m-auto">
          <RoundButton onClick={onClose}>Close scanner</RoundButton>
        </div>
      </div>
    </div>
  );
}

export default QrCodeScanner;
