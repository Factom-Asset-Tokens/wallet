module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'factom-asset-tokens.wallet',
        productName: 'FAT Wallet',
        linux: {
          category: 'Utility',
          target: ['deb', 'zip', 'AppImage']
        },
        appImage: {
          license: 'LICENSE.md'
        },
        mac: {
          category: 'public.app-category.finance'
        }
      }
    }
  }
};
