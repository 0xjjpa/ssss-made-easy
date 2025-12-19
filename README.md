# SSSS Toolkit

## Introduction

This is a frontend for [`shamir-secret-sharing`][2], an audited JavaScript implementation of [Shamir's Secret Sharing Scheme][1].
It provides convenient features for splitting and combining secrets:

* Share secret shares via QR Code
* Scan a QR code to enter a share for combination
* Generate secure random secrets
* SHA256 hash verification

All of this is performed locally in the browser, no data is sent to the server. It is as safe as your browser is (judge for yourself!).

This project is released under the terms of the GNU GENERAL PUBLIC LICENSE Version 3 (GPLv3).

## Try it out

You can use the installation at https://ssss.dont-panic.cc/ that will run the latest release version.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


[1]: https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing
[2]: https://www.npmjs.com/package/shamir-secret-sharing
