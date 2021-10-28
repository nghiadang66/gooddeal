exports.cleanStore = (store) => {
    store.ownerId = undefined;
    store.staffIds = undefined;
    store.e_wallet = undefined;
    store.total_revenue = undefined;

    return store;
};
