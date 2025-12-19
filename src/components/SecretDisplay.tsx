import { useState } from 'react';
import QrCode from './QrCode';
import RoundButton from './RoundButton';

interface Props {
  secret: string;
}

function SecretDisplay({ secret }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="sm:rounded-2xl rounded-lg bg-green-300 sm:px-2 px-1 sm:py-2 py-1 m-1 text-black flex">
        <div className="sm:p-2 p-1 truncate font-mono text-ellipsis flex-grow select-all">{secret}</div>
        <button className="sm:p-2 p-1 bg-blue-500" title="Show QR Code" onClick={() => setShowModal(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white text-black rounded-2xl shadow-lg p-6 w-[90%] max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4 text-center">Share via QR Code</h3>
            <QrCode
              value={secret}
              className="mx-auto cursor-copy"
              margin={1}
              onCopy={() => setMessage('QR code copied to clipboard')}
              onError={(msg) => setMessage(msg)}
            />
            <div className="select-all font-mono mt-3 break-all text-center">{secret}</div>
            {message && <div className="text-center text-sm text-gray-700 mt-2">{message}</div>}
            <div className="flex gap-3 mt-4 justify-center">
              <RoundButton onClick={() => setMessage(null)} filled={false}>
                Clear message
              </RoundButton>
              <RoundButton onClick={() => setShowModal(false)}>Close</RoundButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecretDisplay;
