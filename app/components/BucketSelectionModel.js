'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const style = {
	position: 'absolute',
	top: '20%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '50%',
	bgcolor: 'background.paper',
	borderRadius: '8px',
	boxShadow: 24,
	p: 4,
};

export default function BucketSelectionModel({
	open,
	handleClose,
	exchanges,
	activeExchange,
	bucketSymbols,
	setBucketSymbols,
	removeBucketSymbol,
}) {
	const [currentBucketSymbol, setCurrentBucketSymbol] = useState({
		symbol: null,
		baseAsset: null,
		quoteAsset: null,
		count: 0,
	});

	const [filteredSymbols, setFilterSymbols] = useState([]);

	useEffect(() => {
		if (activeExchange)
			setFilterSymbols(Object.keys(exchanges[activeExchange].symbols));
	}, [activeExchange]);

	const handleChange = (event, newValue) => {
		setCurrentBucketSymbol({
			...currentBucketSymbol,
			symbol: newValue,
			quoteAsset: newValue
				? exchanges[activeExchange].symbols[newValue].quoteAsset
				: null,
			baseAsset: newValue
				? exchanges[activeExchange].symbols[newValue].baseAsset
				: null,
		});

		if (newValue != null && newValue != '') {
			setFilterSymbols(
				Object.keys(exchanges[activeExchange].symbols).filter(
					(curr) =>
						exchanges[activeExchange].symbols[curr].quoteAsset ==
						exchanges[activeExchange].symbols[newValue].quoteAsset
				)
			);
		} else {
			setFilterSymbols(Object.keys(exchanges[activeExchange].symbols));
		}
	};

	const handlenewBucketItem = () => {
		if (
			currentBucketSymbol.symbol != null &&
			currentBucketSymbol.count != null &&
			currentBucketSymbol.count != '' &&
			currentBucketSymbol.count > 0
		) {
			setBucketSymbols(currentBucketSymbol);
		}
	};

	const handleCountChange = (e) => {
		const val = e.target.value;

		if (val != null && val != '') {
			setCurrentBucketSymbol({
				...currentBucketSymbol,
				count: Number.parseInt(val),
			});
		} else {
			setCurrentBucketSymbol({
				...currentBucketSymbol,
				count: '',
			});
		}
	};

	const handleRemoveBucketSymbol = (removeSymbol) => {
		// console.log('values', removeSymbol);
		removeBucketSymbol(removeSymbol);
	};

	// console.log('bucket symbols', bucketSymbols);
	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby='modal-modal-title'
			aria-describedby='modal-modal-description'
		>
			<Box sx={style}>
				<div className='flex items-end'>
					<div>
						<label
							for='countries'
							class='block mb-2 text-lg font-medium text-gray-900 dark:text-white'
						>
							Select Symbol
						</label>
						<Autocomplete
							disablePortal
							id='combo-box-demo'
							onChange={handleChange}
							options={filteredSymbols}
							sx={{ width: 300 }}
							renderInput={(params) => (
								<TextField {...params} label='Symbol' />
							)}
						/>
					</div>
					<div className='ml-8'>
						<label
							for='countries'
							class='block mb-2 text-lg font-medium text-gray-900 dark:text-white'
						>
							Enter Count
						</label>
						<input
							onChange={handleCountChange}
							value={currentBucketSymbol.count}
							type='number'
							id='number-input'
							aria-describedby='helper-text-explanation'
							class='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
							placeholder='2'
							required
						/>
					</div>
					<button
						onClick={handlenewBucketItem}
						type='button'
						class='ml-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
					>
						Add
						<svg
							class='rtl:rotate-180 w-3.5 h-3.5 ms-2'
							aria-hidden='true'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 14 10'
						>
							<path
								stroke='currentColor'
								stroke-linecap='round'
								stroke-linejoin='round'
								stroke-width='2'
								d='M1 5h12m0 0L9 1m4 4L9 9'
							/>
						</svg>
					</button>
				</div>

				<div className='mt-6'>
					<h1>Symbols</h1>
					<div className='mt-2 symbols flex flex-wrap'>
						{bucketSymbols &&
							bucketSymbols.map((curr, idx) => {
								return (
									<span
										key={idx}
										id='badge-dismiss-default'
										class='inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300'
									>
										{curr.baseAsset}
										<span class='inline-flex items-center justify-center py-0.5 px-1 ms-2 text-xs font-semibold text-white bg-blue-950 rounded-full'>
											{curr.count}
										</span>
										<button
											onClick={() =>
												handleRemoveBucketSymbol(
													curr.symbol
												)
											}
											type='button'
											class='inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300'
											data-dismiss-target='#badge-dismiss-default'
											aria-label='Remove'
										>
											<svg
												class='w-2 h-2'
												aria-hidden='true'
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 14 14'
											>
												<path
													stroke='currentColor'
													stroke-linecap='round'
													stroke-linejoin='round'
													stroke-width='2'
													d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
												/>
											</svg>
											<span class='sr-only'>
												Remove badge
											</span>
										</button>
									</span>
								);
							})}
					</div>
				</div>
				<div className='flex justify-end'>
					<button
						onClick={handleClose}
						type='button'
						class='focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900'
					>
						Close
					</button>
				</div>
			</Box>
		</Modal>
	);
}
