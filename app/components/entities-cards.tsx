import {Await, Link} from '@remix-run/react';
import {Image} from '@unpic/react';
import {motion} from 'framer-motion';
import {Suspense} from 'react';
import {YemSpinner} from './yem-spinner.js';
import {buildImgSource} from '~/utils/build-cloudflare-image-source.js';

type ClassCardPropierties = {
	readonly course: Record<string, any>;
	readonly to: string;
};

type GenericEntityCardPropierties = ClassCardPropierties & {
	readonly activity: Promise<{
		data: {
			totalLessons: number;
			completedLessons: number;
			percentage: number;
		};
	}>;
};

export function GenericEntityCard({course, to, activity}: GenericEntityCardPropierties) {
	return (
		<motion.div
			whileHover={{
				scale: 1.05,
				transition: {duration: 0.5},
			}}
			className='portrait:w-48 w-72 portrait:h-80 h-48 relative rounded-xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 flex-shrink-0'
		>
			<Image
				className='absolute top-0 left-0 w-full h-full rounded-xl -z-10'
				src={buildImgSource(`${course.thumbnailUrl}`)}
				cdn='cloudflare_images'
				layout='constrained'
				width={320}
				height={320}
				alt={course.name as string}
			/>
			<Link to={to}>
				<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 p-4 flex flex-col justify-between'>
					<h2 className='text-mauve-3 text-lg drop-shadow-md'>
						{course.name}
					</h2>
					<div>
						<p className='text-mauve-5 text-sm text-ellipsis line-clamp-3'>{course.description}</p>
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={activity}>
								{activity => <p className='text-mauve-5 text-xs'>Progresso: {activity?.data.percentage}%</p>}
							</Await>
						</Suspense>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

export function LessonEntityCard({course, to}: ClassCardPropierties) {
	return (
		<motion.div
			whileHover={{
				scale: 1.05,
				transition: {duration: 0.5},
			}}
			className='portrait:w-48 w-72 portrait:h-80 h-48 relative rounded-xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 flex-shrink-0'
		>
			<Image
				className='absolute top-0 left-0 w-full h-full rounded-xl -z-10'
				src={buildImgSource(`${course.thumbnailUrl}`)}
				cdn='cloudflare_images'
				layout='constrained'
				width={320}
				height={320}
				alt={course.name as string}
			/>
			<Link to={to}>
				<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 p-4 flex flex-col justify-between'>
					<h2 className='text-mauve-3 text-lg drop-shadow-md'>
						{course.name}
					</h2>
					<div>
						<p className='text-mauve-5 text-sm text-ellipsis line-clamp-3'>{course.description}</p>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
