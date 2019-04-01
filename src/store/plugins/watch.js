export default store => {
  store.watch(
    state => state.fatd.status,
    status => {
      if (status === 'ok') {
        // Refresh token clis
        store.dispatch('tokens/initializeTokenClis');
      }
    }
  );
};
