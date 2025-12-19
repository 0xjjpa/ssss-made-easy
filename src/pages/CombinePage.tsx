import { useEffect, useMemo, useRef, useState } from 'react';
import LabelWithDescription from '../components/LabelWithDescription';
import PageTitle from '../components/PageTitle';
import QrCodeScanner from '../components/QrCodeScanner';
import RoundButton from '../components/RoundButton';
import SecretDisplay from '../components/SecretDisplay';
import { combineSecret } from '../lib/ssss-util';
import { copyTextToClipboard } from '../lib/clipboard-utils';

function CombinePage() {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [txtShares, setTxtShares] = useState('');
  const [shares, setShares] = useState<string[]>([]);
  const [secret, setSecret] = useState('');
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [showQrCodeScanner, setShowQrCodeScanner] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [secretHash, setSecretHash] = useState('');

  useEffect(() => {
    setShares(
      txtShares
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    );
  }, [txtShares]);

  useEffect(() => {
    async function computeSha256(text: string) {
      if (!text) return '';
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    computeSha256(secret).then(setSecretHash);
  }, [secret]);

  const validation = useMemo(() => {
    const result: string[] = [];
    if (shares.length < 2) {
      result.push('Need at least 2 key shares.');
    }
    return result;
  }, [shares]);

  const onCombine = () => {
    setWarningMessages(validation);
    setErrorMessages([]);
    setSecret('');
    setShowSecret(false);
    if (shares.length >= 2) {
      try {
        setSecret(combineSecret(shares));
      } catch (err) {
        setErrorMessages([String(err)]);
      }
    }
  };

  const onClear = () => {
    setSecret('');
    setTxtShares('');
    setShowSecret(false);
  };

  const onPaste = () => {
    if (textAreaRef.current && txtShares.trim().length === 0) {
      setTimeout(() => {
        const ta = textAreaRef.current;
        if (!ta) return;
        ta.scrollLeft = 0;
        ta.scrollTop = 0;
      }, 1);
    }
  };

  const onCopySecret = () => {
    copyTextToClipboard(secret, (err) => {
      if (err) {
        setErrorMessages([String(err)]);
      }
    });
  };

  return (
    <div className="text-white w-96 mx-auto mt-6 flex flex-col text-left">
      <PageTitle>Combine shares of a secret</PageTitle>
      <div className="p-5 bg-indigo-400 rounded-3xl">
        <LabelWithDescription
          target="Shares"
          title="Shares:"
          description="You need to enter the correct amount of key shares here. This information cannot be deduced from the shares themselves."
        />
        <textarea
          ref={textAreaRef}
          onPaste={onPaste}
          id="Shares"
          rows={4}
          className="block mt-2.5 p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 font-mono whitespace-pre"
          placeholder="Enter one key share per line..."
          value={txtShares}
          onChange={(e) => setTxtShares(e.target.value)}
        />
      </div>

      <div className="max-w-sm mt-2">
        <RoundButton fullWidth onClick={() => setShowQrCodeScanner(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          Scan QR Code
        </RoundButton>
        {showQrCodeScanner && (
          <QrCodeScanner
            onClose={() => setShowQrCodeScanner(false)}
            onScanSuccess={(result) => {
              setTxtShares((prev) => (prev.length > 0 ? `${prev}\n${result.decodedText}` : result.decodedText));
              setShowQrCodeScanner(false);
            }}
          />
        )}
      </div>

      <div className="mt-5">
        Please make sure your secret was actually created with a <em>threshold</em> of <strong>{shares.length}</strong>.
        <br />
      </div>
      <div className="mt-2 mb-5 text-xs">
        If you supply <strong>too few <em>or</em> too many</strong> key shares, the reconstructed secret will be wrong.
        And there is no mathematical way to know.
      </div>

      {errorMessages.length > 0 && (
        <ul className="rounded-3xl px-10 py-5 mb-5 bg-red-500 text-black text-left list-disc list-outside">
          {errorMessages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
      {warningMessages.length > 0 && (
        <ul className="rounded-3xl px-10 py-5 mb-5 bg-yellow-100 text-black text-left list-disc list-outside">
          {warningMessages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}

      <div className="max-w-sm">
        <RoundButton fullWidth onClick={onCombine}>Combine</RoundButton>
      </div>

      {secret.length > 0 && (
        <div>
          <h3 className="text-3xl font-bold mt-6 mb-3 mx-auto leading-tight text-white">Reconstructed secret</h3>

          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={showSecret} onChange={(e) => setShowSecret(e.target.checked)} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              <span className="ms-3 text-sm font-medium text-white">{showSecret ? 'Secret visible' : 'Secret hidden'}</span>
            </label>
          </div>

          {showSecret ? (
            <SecretDisplay secret={secret} />
          ) : (
            <div className="sm:rounded-2xl rounded-lg bg-gray-500 sm:px-2 px-1 sm:py-2 py-1 m-1 text-black flex">
              <div className="sm:p-2 p-1 truncate font-mono text-ellipsis flex-grow">{'*'.repeat(secret.length)}</div>
            </div>
          )}

          {secretHash && (
            <div className="mt-3 text-xs text-gray-300 break-all">
              <span className="font-semibold">SHA256:</span> {secretHash}
            </div>
          )}

          <div className="max-w-sm mt-6">
            <RoundButton fullWidth onClick={onCopySecret}>
              Copy to clipboard
            </RoundButton>
          </div>
          <div className="max-w-sm mt-2">
            <RoundButton fullWidth filled={false} onClick={onClear}>
              Clear
            </RoundButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default CombinePage;
