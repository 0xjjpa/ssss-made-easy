import { useEffect, useMemo, useState } from 'react';
import LabelWithDescription from '../components/LabelWithDescription';
import PageTitle from '../components/PageTitle';
import RoundButton from '../components/RoundButton';
import SecretDisplay from '../components/SecretDisplay';
import { splitSecret } from '../lib/ssss-util';
import { copyTextToClipboard } from '../lib/clipboard-utils';

const CHARSET = 'ABCDEFGHJKMNPQRTUVWXYZ234679-';

function SplitPage() {
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [numShares, setNumShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [shares, setShares] = useState<string[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [secretHash, setSecretHash] = useState('');
  const [message, setMessage] = useState<string | null>(null);

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
    if (secret.length === 0) {
      result.push('Secret cannot be empty.');
    }
    if (secret.length > 128) {
      result.push('Secret can be maximum 128 characters.');
    }
    if (Number.isNaN(numShares) || numShares <= 1 || numShares > 256) {
      result.push('Number of shares needs to be a number between 1 and 256.');
    }
    if (Number.isNaN(threshold) || threshold <= 1 || threshold > numShares) {
      result.push('Threshold needs to be a number between 1 and the number of shares.');
    }
    return result;
  }, [secret, numShares, threshold]);

  const generateSecureSecret = () => {
    const length = 32;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i += 1) {
      result += CHARSET[array[i] % CHARSET.length];
    }
    setSecret(result);
  };

  const onSplit = () => {
    setValidationMessages(validation);
    setShares([]);
    if (validation.length === 0) {
      try {
        setShares(splitSecret(secret, token, numShares, threshold));
      } catch (err) {
        setMessage(String(err));
      }
    }
  };

  const copyAll = () => {
    copyTextToClipboard(shares.join('\n'), (err) => {
      if (err) {
        setMessage(String(err));
      } else {
        setMessage(`Copied ${shares.length} shares to the clipboard.`);
      }
    });
  };

  return (
    <div className="text-white sm:w-96 w-3/4 mx-auto mt-6 flex flex-col text-left">
      <PageTitle>Split a secret</PageTitle>
      <div className="mb-6 p-5 bg-indigo-400 rounded-3xl">
        <LabelWithDescription target="secret" title="Secret:" description="This is the secret you want to share with others." />
        <div className="flex gap-2 mt-2">
          <input
            id="Secret"
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="text-black rounded-lg p-1 flex-grow"
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm"
            title={showSecret ? 'Hide secret' : 'Show secret'}
          >
            {showSecret ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          type="button"
          onClick={generateSecureSecret}
          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm w-full"
        >
          Generate Secure Secret (32 characters)
        </button>
        {secretHash && (
          <div className="mt-3 text-xs text-indigo-100 break-all">
            <span className="font-semibold">SHA256:</span> {secretHash}
          </div>
        )}
      </div>

      <div className="mb-6 p-5 bg-indigo-400 rounded-3xl">
        <div>
          <LabelWithDescription target="shares" title="Shares:" description="The number of parts you want to split the secret into." />
          <input
            id="shares"
            type="number"
            value={numShares}
            onChange={(e) => setNumShares(parseInt(e.target.value, 10) || 0)}
            min={2}
            max={256}
            className="text-black rounded-lg p-1 mt-2 w-full"
          />
        </div>
        <div className="mt-3">
          <LabelWithDescription target="threshold" title="Threshold:" description="How many parts are required to restore the secret." />
          <input
            id="threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)}
            min={2}
            max={256}
            className="text-black rounded-lg p-1 mt-2 w-full"
          />
        </div>
      </div>

      <div className="mb-6 p-5 bg-indigo-400 rounded-3xl">
        <LabelWithDescription target="token" title="Token:" description="Optional. A prefix for the generated tokens." />
        <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} className="text-black rounded-lg p-1 mt-2 w-full" />
      </div>

      {validationMessages.length > 0 && (
        <ul className="sm:rounded-3xl rounded-lg sm:px-10 px-10 sm:py-5 py-2 mb-5 bg-yellow-100 text-black text-left list-disc list-outside">
          {validationMessages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}

      {message && <div className="text-sm text-yellow-100 mb-3">{message}</div>}

      <div className="max-w-sm ">
        <RoundButton fullWidth onClick={onSplit}>
          Split the secret
        </RoundButton>
      </div>

      {shares.length > 0 && (
        <div className="mt-6">
          <h3 className="text-3xl font-bold mb-3 mx-auto leading-tight font-mono text-white">Shares of the Secret</h3>
          <RoundButton className="mb-3" onClick={copyAll}>
            Copy all to clipboard
          </RoundButton>
          {shares.map((share) => (
            <SecretDisplay key={share} secret={share} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SplitPage;
