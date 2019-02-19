
export default (store) => {
    store.watch((state) => state.walletd.status, (status) => {
        if (status === "ok" || status === "ko") {
            Promise.all([store.dispatch('address/init'), store.dispatch('identity/init')]);
        }
    });
}