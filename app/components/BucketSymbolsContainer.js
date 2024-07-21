export default function BucketSymbolContiner({ bucketSymbols }) {
	return (
		<div className='symbols flex flex-wrap mb-2'>
			{bucketSymbols &&
				bucketSymbols.map((curr, idx) => {
					return (
						<span
							key={idx}
							id='badge-dismiss-default'
							class='inline-flex items-center my-1 px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300'
						>
							{curr.baseAsset}
							<span class='inline-flex items-center justify-center ms-2 py-0.5 px-1 text-xs font-semibold text-white bg-blue-950 rounded-full'>
								{curr.count}
							</span>
						</span>
					);
				})}
		</div>
	);
}
