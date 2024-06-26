import {ChevronRightIcon} from '@heroicons/react/24/outline';
import {Link} from '@remix-run/react';
import {Fragment} from 'react/jsx-runtime';

type BreadcrumbsData = {
	readonly data: Array<[string, string]>;
}; // [url, label]

export function Breadcrumbs({data}: BreadcrumbsData) {
	return (
		<div className='flex justify-center mb-7'>
			<div className='bg-mauvea-2 dark:bg-mauvedarka-2 rounded-full py-3 px-5 flex justify-center items-center gap-1 max-w-full flex-wrap'>
				<Link to='/courses'>Cursos</Link>
				{data.map(([url, label], index) => {
					if (index + 1 === data.length) {
						return (
							<Fragment key={url}>
								<p><ChevronRightIcon className='size-4'/></p>
								<p>{label}</p>
							</Fragment>
						);
					}

					return (
						<Fragment key={url}>
							<p><ChevronRightIcon className='size-4'/></p>
							<Link to={url}>{label}</Link>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
