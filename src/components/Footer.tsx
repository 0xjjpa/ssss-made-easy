import version from '../lib/assets/version.txt?raw';

function Footer() {
  return (
    <footer className="p-4 pb-0 md:pb-1 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800">
      <span className="text-sm text-gray-500 sm:text-left dark:text-gray-400">
        Released under <a href="/gplv3.txt" className="hover:underline">GPLv3</a>.
        <br />
        Build: {version.trim()}
      </span>
    </footer>
  );
}

export default Footer;
