import { create } from 'zustand';
import {
	subscribe,
	unsubscribe,
	init,
	subscribeVirtual,
	unsubscribeVirtual,
	subscribeBasket,
	unsubscribeBasket,
} from '../root/Gui-Library-Interface';

// const subscriptions = {
//     "exchange_key": {
//         "vanilla": [],
//         "crossPrices": [],
//         "baskets": []
//     }
// }

// const symbols = ["BTCUSDT",""];

// const exchanges = {
//     "key_1": {
//         "lastTab": ""
//     }
// }

export const subscriptionTypeEnum = {
	VANILLA: 'vanilla',
	CROSS_PRICE: 'crossPrices',
	BASKETS: 'baskets',
};

export const subsTypeEnum = {
	TRADE: 'trade',
	DEPTH: 'depth',
};

export const DepthActions = {
	SUBSCRIBE: true,
	UNSUBSCRIBE: false,
};

export const logger = {
	debug: (str) => console.log(str),
	info: (str) => console.log(str),
	warn: (str) => console.log(str),
	error: (str) => console.log(str),
};

const HulkStore = (set, get) => ({
	subscriptions: null,
	exchanges: {},
	activeExchange: null,
	isReady: false,

	init: () => {
		console.log('initilize everything');

		try {
			init(
				{
					auth_server: [
						'http://165.232.187.129:90',
						'http://143.244.139.3:90',
						'http://143.244.131.67:90',
					],
					credentials: { user: 'test_user', password: 'test_pwd' },
				},
				logger,
				(meta) => {
					// create subscription object
					const symbolDict = meta.allowed_instruments;
					const allowed_exchanges = meta.allowed_exchanges;

					const reducedSymbolDict = {};

					for (let [key, value] of symbolDict) {
						if (!reducedSymbolDict[`${value.exchange}`])
							reducedSymbolDict[`${value.exchange}`] = {};
						reducedSymbolDict[`${value.exchange}`][value.symbol] =
							value;
					}

					set((state) => ({
						exchanges: allowed_exchanges.reduce((total, temp) => {
							total[`${temp}`] = {
								symbols: reducedSymbolDict[`${temp}`]
									? reducedSymbolDict[`${temp}`]
									: [],
							};
							return total;
						}, {}),
						subscriptions: allowed_exchanges.reduce(
							(total, temp) => {
								total[`${temp}`] = {
									vanilla: [],
									crossPrices: [],
									baskets: [],
								};
								return total;
							},
							{}
						),
						isReady: true,
					}));
				}
			);
		} catch (error) {
			throw Error('Cannot Connect with server');
		}
	},

	changeActiveExchange: (newActiveExchange) => {
		// unsubscribe to all current subscripitions
		set((state) => {
			if (state.activeExchange) {
				state.unsubscribeAllInActive(
					state.activeExchange,
					state.subscriptions
				);

				const exchange = state.activeExchange;
				let newSubVanillaActiveExchange = [
					...state.subscriptions[exchange][
						subscriptionTypeEnum.VANILLA
					],
				];
				newSubVanillaActiveExchange = newSubVanillaActiveExchange.map(
					(val) => ({ ...val, cb: null, depth_cb: null })
				);

				let newSubCrossPriceActiveExchange = [
					...state.subscriptions[exchange][
						subscriptionTypeEnum.CROSS_PRICE
					],
				];
				newSubCrossPriceActiveExchange =
					newSubCrossPriceActiveExchange.map((val) => ({
						...val,
						cb: null,
						depth_cb: null,
					}));

				let newSubBucketActiveExchange = [
					...state.subscriptions[exchange][
						subscriptionTypeEnum.BASKETS
					],
				];
				newSubBucketActiveExchange = newSubBucketActiveExchange.map(
					(val) => ({ ...val, cb: null, depth_cb: null })
				);

				return {
					subscriptions: {
						...state.subscriptions,
						[exchange]: {
							...state.subscriptions[exchange],
							[subscriptionTypeEnum.VANILLA]:
								newSubVanillaActiveExchange,
							[subscriptionTypeEnum.CROSS_PRICE]:
								newSubCrossPriceActiveExchange,
							[subscriptionTypeEnum.BASKETS]:
								newSubBucketActiveExchange,
						},
					},
					activeExchange: newActiveExchange,
				};
			} else {
				return {
					activeExchange: newActiveExchange,
				};
			}
		});
	},

	addSubscription: (type, newSubs) => {
		set((state) => {
			const exchange = state.activeExchange;
			const newSubInActiveExchange = [
				...state.subscriptions[exchange][type],
			];
			newSubInActiveExchange.push(newSubs);

			return {
				subscriptions: {
					...state.subscriptions,
					[exchange]: {
						...state.subscriptions[exchange],
						[type]: newSubInActiveExchange,
					},
				},
			};
		});
	},

	removeSubscription: (type, symbol) => {
		set((state) => {
			const exchange = state.activeExchange;
			let newSubInActiveExchange = [
				...state.subscriptions[exchange][type],
			];
			newSubInActiveExchange = newSubInActiveExchange.filter(
				(val) => val.symbol != symbol
			);

			return {
				subscriptions: {
					...state.subscriptions,
					[exchange]: {
						...state.subscriptions[exchange],
						[type]: newSubInActiveExchange,
					},
				},
			};
		});
	},

	manageDepthSubscription: (type, symbol, action) => {
		set((state) => {
			const exchange = state.activeExchange;
			let newSubInActiveExchange = [
				...state.subscriptions[exchange][type],
			];
			newSubInActiveExchange = newSubInActiveExchange.map((val) => {
				if (val.symbol == symbol) {
					return {
						...val,
						depth: action,
					};
				} else {
					return val;
				}
			});

			return {
				subscriptions: {
					...state.subscriptions,
					[exchange]: {
						...state.subscriptions[exchange],
						[type]: newSubInActiveExchange,
					},
				},
			};
		});
	},

	subscribe: (type, symbol, exchange, subsType, cb, subsObject = {}) => {
		switch (type) {
			case subscriptionTypeEnum.VANILLA:
				subscribe(symbol, exchange, subsType, cb);
				break;
			case subscriptionTypeEnum.CROSS_PRICE:
				subscribeVirtual(
					subsObject.baseAssets[0],
					subsObject.baseAssets[1],
					subsObject.quoteAsset,
					exchange,
					cb
				);
				break;
			case subscriptionTypeEnum.BASKETS:
				const assets = [];
				const cofficeints = [];

				subsObject.assets.forEach((sub) => {
					assets.push(sub.baseAsset);
					cofficeints.push(sub.count);
				});

				subscribeBasket(
					assets,
					cofficeints,
					subsObject.assets[0].quoteAsset,
					subsObject.destinationSymbol,
					exchange,
					cb
				);
				break;
			default:
				throw new Error('Incorrect Subscription Type');
		}

		set((state) => {
			const exchange = state.activeExchange;
			let newSubInActiveExchange = [
				...state.subscriptions[exchange][type],
			];
			newSubInActiveExchange = newSubInActiveExchange.map((val) => {
				if (val.symbol == symbol) {
					return {
						...val,
						cb: subsType == subsTypeEnum.TRADE ? cb : val.cb,
						depth_cb:
							subsType == subsTypeEnum.DEPTH ? cb : val.depth_cb,
					};
				} else {
					return val;
				}
			});

			return {
				subscriptions: {
					...state.subscriptions,
					[exchange]: {
						...state.subscriptions[exchange],
						[type]: newSubInActiveExchange,
					},
				},
			};
		});
	},

	unsubscribe: (type, symbol, exchange, subsType, cb, subsObject = {}) => {
		switch (type) {
			case subscriptionTypeEnum.VANILLA:
				unsubscribe(symbol, exchange, subsType, cb);
				break;
			case subscriptionTypeEnum.CROSS_PRICE:
				unsubscribeVirtual(
					subsObject.baseAssets[0],
					subsObject.baseAssets[1],
					subsObject.quoteAsset,
					exchange,
					cb
				);
				break;
			case subscriptionTypeEnum.BASKETS:
				const assets = [];
				const cofficeints = [];

				subsObject.assets.forEach((sub) => {
					assets.push(sub.baseAsset);
					cofficeints.push(sub.count);
				});

				unsubscribeBasket(
					assets,
					cofficeints,
					subsObject.assets[0].quoteAsset,
					subsObject.destinationSymbol,
					exchange,
					cb
				);
				break;
			default:
				throw new Error('Incorrect Subscription Type');
		}

		set((state) => {
			const exchange = state.activeExchange;
			let newSubInActiveExchange = [
				...state.subscriptions[exchange][type],
			];
			newSubInActiveExchange = newSubInActiveExchange.map((val) => {
				if (val.symbol == symbol) {
					return {
						...val,
						cb: subsType == subsTypeEnum.TRADE ? null : val.cb,
						depth_cb:
							subsType == subsTypeEnum.DEPTH
								? null
								: val.depth_cb,
					};
				} else {
					return val;
				}
			});

			return {
				subscriptions: {
					...state.subscriptions,
					[exchange]: {
						...state.subscriptions[exchange],
						[type]: newSubInActiveExchange,
					},
				},
			};
		});
	},

	unsubscribeAllInActive: (activeExchange, subs) => {
		// unsubscribe all the exsisting subs
		console.log('unsubsrrine all current once');
		subs[activeExchange].vanilla.forEach((sub) => {
			if (sub.cb)
				unsubscribe(
					sub.symbol,
					activeExchange,
					subsTypeEnum.TRADE,
					sub.cb
				);

			if (sub.depth_cb) {
				unsubscribe(
					sub.symbol,
					activeExchange,
					subsTypeEnum.DEPTH,
					sub.depth_cb
				);
			}
		});

		subs[activeExchange].crossPrices.forEach((sub) => {
			if (sub.cb)
				unsubscribeVirtual(
					sub.baseAssets[0],
					sub.baseAssets[1],
					sub.quoteAsset,
					activeExchange,
					sub.cb
				);
		});

		subs[activeExchange].baskets.forEach((subsObject) => {
			if (subsObject.cb) {
				const assets = [];
				const cofficeints = [];

				subsObject.assets.forEach((sub) => {
					assets.push(sub.baseAsset);
					cofficeints.push(sub.count);
				});

				unsubscribeBasket(
					assets,
					cofficeints,
					subsObject.assets[0].quoteAsset,
					subsObject.destinationSymbol,
					activeExchange,
					subsObject.cb
				);
			}
		});
	},
});

export const useHulkStore = create(HulkStore);
