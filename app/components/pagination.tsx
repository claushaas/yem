import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router';

type PaginationProperties = {
	readonly pages?: number;
	readonly actualPage?: number;
};

export function Pagination({
	pages = 1,
	actualPage = 1,
}: PaginationProperties) {
	const { pathname, search } = useLocation();

	const searchParameters = search
		.slice(1)
		.split('&')
		.filter((parameter) => !parameter.startsWith('page'))
		.join('&');

	const limitArraySize = (
		array: number[],
		currentPage: number,
		maxSize = 5,
	) => {
		if (array.length <= maxSize) {
			return array;
		}

		let startIndex = 0;
		if (currentPage <= 3) {
			startIndex = 0;
		} else if (currentPage >= array.length - 2) {
			startIndex = array.length - maxSize;
		} else {
			startIndex = currentPage - 3;
		}

		return array.slice(startIndex, startIndex + maxSize);
	};

	const pagesArray = Array.from({ length: pages }, (_, index) => index + 1);
	const limitedPagesArray = limitArraySize(pagesArray, actualPage);

	const limitedArrayFirstPage = limitedPagesArray[0];
	const lastPage = pagesArray.at(-1);

	return (
		<div className="flex items-center justify-center gap-2">
			{actualPage > 1 && (
				<Link to={`${pathname}?page=${actualPage - 1}&${searchParameters}`}>
					<ChevronLeftIcon className="size-4" />
				</Link>
			)}
			{limitedArrayFirstPage !== 1 && (
				<>
					<Link to={`${pathname}?page=1&${searchParameters}`}>
						<p>1</p>
					</Link>
					<p>...</p>
				</>
			)}
			{limitedPagesArray.map((page) => {
				const isActualPage = page === actualPage;

				if (isActualPage) {
					return (
						<p className="text-mauve-6 dark:text-mauve-10" key={page}>
							{page}
						</p>
					);
				}

				return (
					<Link key={page} to={`${pathname}?page=${page}&${searchParameters}`}>
						<p>{page}</p>
					</Link>
				);
			})}
			{limitedPagesArray.at(-1) !== lastPage && (
				<>
					<p>...</p>
					<Link to={`${pathname}?page=${lastPage}&${searchParameters}`}>
						<p>{lastPage}</p>
					</Link>
				</>
			)}
			{actualPage < pages && (
				<Link to={`${pathname}?page=${actualPage + 1}&${searchParameters}`}>
					<ChevronRightIcon className="size-4" />
				</Link>
			)}
		</div>
	);
}
