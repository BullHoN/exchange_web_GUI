'use client';

import { useEffect } from 'react';
import { useHulkStore } from '../stores/store';

export function InitConection() {
	const hulkStore = useHulkStore((state) => state);

	useEffect(() => {
		hulkStore.init();
	}, []);

	return <></>;
}
