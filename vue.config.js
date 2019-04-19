module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'factom-asset-tokens.wallet',
        productName: 'FAT Wallet',
        linux: {
          icon: 'public/icons/',
          category: 'Utility',
          target: ['deb', 'zip', 'AppImage']
        },
        appImage: {
          license: 'LICENSE.md'
        },
        win: {
          icon: 'public/icons/icon.ico'
        }
      }
    }
  }
};
