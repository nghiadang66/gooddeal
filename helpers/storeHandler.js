exports.cleanStore = (store) => {
    store.ownerId = undefined;
    store.staffIds = undefined;
    store.e_wallet = undefined;
    store.proceeds = undefined;

    return store;
};
