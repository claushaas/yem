import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/24/outline';
import {Link, useLocation} from '@remix-run/react';

type PaginationProperties = {
	readonly pages?: number;
	readonly actualPage?: number;
};

export function Pagination({pages = 1, actualPage = 1}: PaginationProperties) {
	const {pathname} = useLocation();

	const limitArraySize = (array: number[], currentPage: number, maxSize = 5) => {
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

	const pagesArray = Array.from({length: pages}, (_, index) => index + 1);
	const limitedPagesArray = limitArraySize(pagesArray, actualPage);

	const firstPage = limitedPagesArray[0];
	const lastPage = pagesArray.at(-1);

	return (
		<div className='flex items-center justify-center gap-2'>
			{actualPage > 1 && (
				<Link to={`${pathname}?page=${actualPage - 1}`}>
					<ChevronLeftIcon className='size-4'/>
				</Link>
			)}
			{firstPage !== 1 && (
				<>
					<Link to={`${pathname}?page=1`}/>
					<p>...</p>
				</>
			)}
			{limitedPagesArray.map(page => {
				const isActualPage = page === actualPage;

				if (isActualPage) {
					return <p key={page} className='text-mauve-6 dark:text-mauve-10'>{page}</p>;
				}

				return (
					<Link key={page} to={`${pathname}?page=${page}`}>
						<p>{page}</p>
					</Link>
				);
			})}
			{limitedPagesArray.at(-1) !== lastPage && (
				<>
					<p>...</p>
					<Link to={`${pathname}?page=${lastPage}`}/>
				</>
			)}
			{actualPage < pages && (
				<Link to={`${pathname}?page=${actualPage + 1}`}>
					<ChevronRightIcon className='size-4'/>
				</Link>
			)}
		</div>
	);
}
