import { useEffect, useState } from 'react';
import {
	DepthActions,
	subscriptionTypeEnum,
	subsTypeEnum,
	useHulkStore,
} from '../stores/store';
import { useCallback } from 'react';
import BucketSymbolContiner from './BucketSymbolsContainer';
import { UpArrow, DownArrow } from './UtilsComponents';

export default function BucketTableRow(props) {
	const { symbol, assets, destinationSymbol } = props.subsciption;
	const { subscribe, unsubscribe, removeSubscription } = useHulkStore(
		(state) => state
	);
	const [currSub, setCurrSub] = useState({ price: 0, lastPrice: 0 });

	let lastPrice = 0;

	const tradeCallback = useCallback((data) => {
		setCurrSub({
			lastPrice: lastPrice,
			price: data.price,
		});
		lastPrice = data.price
	}, []);

	const handleSymbolUnsubscription = () => {
		unsubscribe(
			props.currentTAB,
			symbol,
			props.activeExchange,
			subsTypeEnum.TRADE,
			tradeCallback,
			props.subsciption
		);
		removeSubscription(props.currentTAB, symbol);
	};

	useEffect(() => {
		setCurrSub({ price: 0, lastPrice: 0 });
		subscribe(
			props.currentTAB,
			symbol,
			props.activeExchange,
			subsTypeEnum.TRADE,
			tradeCallback,
			props.subsciption
		);
	}, [symbol]);

	// console.log('subscritpiton', props.subsciption);
	return (
		<div className='my-2 flex items-center w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 rounded-md focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3'>
			<div className='w-1/4'>
				<BucketSymbolContiner bucketSymbols={assets} />
			</div>
			<div className='w-1/4'>{destinationSymbol}</div>
			<div
				className={
					currSub.price >= currSub.lastPrice
						? 'text-green-600 flex items-center w-1/4'
						: 'text-red-700 flex items-center w-1/4'
				}
			>
				{currSub.price >= currSub.lastPrice ? (
					<UpArrow />
				) : (
					<DownArrow />
				)}

				{currSub.price}
			</div>
			<div className='w-1/4'>
				<button
					onClick={handleSymbolUnsubscription}
					type='button'
					className='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
				>
					Remove
				</button>
			</div>
		</div>
	);
}
