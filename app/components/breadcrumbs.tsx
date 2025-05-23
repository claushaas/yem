import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react/jsx-runtime';
import { Link } from 'react-router';

type BreadcrumbsData = {
	readonly data: Array<[string, string]>;
}; // [url, label]

export function Breadcrumbs({ data }: BreadcrumbsData) {
	return (
		<div className="flex justify-center mb-7">
			<div className="bg-mauvea-2 dark:bg-mauvedarka-2 rounded-full py-3 px-5 flex justify-center items-center gap-1 max-w-full flex-wrap">
				<p>
					<Link to="/courses">Cursos</Link>
				</p>
				{data.map(([url, label], index) => {
					if (index + 1 === data.length) {
						return (
							<Fragment key={url}>
								<p>
									<ChevronRightIcon className="size-4" />
								</p>
								<p className="font-gothamBold">{label}</p>
							</Fragment>
						);
					}

					return (
						<Fragment key={url}>
							<p>
								<ChevronRightIcon className="size-4" />
							</p>
							<p>
								<Link to={url}>{label}</Link>
							</p>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
