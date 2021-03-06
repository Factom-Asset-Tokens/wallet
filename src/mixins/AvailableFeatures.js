export default {
  methods: {
    availableFeatures(...features) {
      const state = this.$store.state;
      for (const feature of features) {
        switch (feature) {
          case 'factomd':
            if (state.factomd.status !== 'ok') {
              return false;
            }
            break;
          case 'fatd':
            if (state.fatd.status !== 'ok') {
              return false;
            }
            break;
          default:
            throw new Error(`Unexpected feature: ${feature}`);
        }
      }
      return true;
    }
  }
};
