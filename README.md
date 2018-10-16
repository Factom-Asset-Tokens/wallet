# FATWallet

A wallet for [Factom Asset Tokens](https://github.com/DBGrow/FAT)

![](assets/wallet.png)



## Installation

Command Line:

```bash
git clone --recurse-submodules https://github.com/DBGrow/FATWallet.git
cd FATWallet
npm install
```



## Running

First, Run a Factomd node on your localhost with API port 8088 accessible (configurable host coming in the near future!).

In the `FATWallet` directory:

```bash
npm start
```

A browser window should pop up pointing to http://localhost:3000. If not, you can use any browser to view the wallet :smile:



## Building Binaries [Broken, work in progress]

```bash
npm run build
```

binaries for Windows, linux, and mac will be built in the `build` directory.

On linux:

```bash
./fatwallet-linux
```



## State Of Development

Follow along with the [project board](https://github.com/DBGrow/FATWallet/projects/1) to stay up to date!

Things to be done ASAP:

- Factoid address / Identity management UI
- Issue token page
- Fix building binaries
- Guides & How To