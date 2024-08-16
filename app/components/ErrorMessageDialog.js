'use client';

import { useHulkStore } from '../stores/store';

export function ErrorMessageDialog() {
	const errors = useHulkStore((state) => state.errors);
	const clearErrors = useHulkStore((state) => state.clearErrors);

	const onClose = () => {
		clearErrors();
	};

	if (errors && errors.length > 0) {
		return (
			<div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50'>
				<div className='bg-white rounded-lg shadow-lg p-6 w-80'>
					<div className='flex justify-between items-center mb-4'>
						<h2 className='text-lg font-semibold text-red-600'>
							Error
						</h2>
						<button
							className='text-gray-600 hover:text-gray-900'
							onClick={onClose}
						>
							&#10005; {/* X icon */}
						</button>
					</div>
					{errors.map((err, idx) => (
						<p className='text-gray-700' key={idx}>
							{err.message}
						</p>
					))}
					<div className='mt-6 flex justify-end'>
						<button
							className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
							onClick={onClose}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	} else {
		return <></>;
	}
}
