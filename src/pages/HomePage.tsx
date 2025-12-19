import Arrow from '../components/Arrow';
import PageTitle from '../components/PageTitle';
import RoundButton from '../components/RoundButton';

function HomePage() {
  return (
    <div>
      <PageTitle>Easily split secrets using Shamir&apos;s Secret Sharing Scheme</PageTitle>
      <p className="mt-5 sm:text-xl text-base leading-relaxed text-white">
        Use
        <a
          href="https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing"
          className="underline ml-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shamir&apos;s Secret Sharing Scheme
        </a>
        to split secrets into multiple parts, where a certain number of shares is required to recover the secret.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <a href="/split">
          <RoundButton>
            Split a secret <Arrow />
          </RoundButton>
        </a>
        <a href="/combine">
          <RoundButton>
            Combine a secret <Arrow />
          </RoundButton>
        </a>
      </div>
    </div>
  );
}

export default HomePage;
