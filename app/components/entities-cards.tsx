import {Await, Link} from 'react-router';
import {Image} from '@unpic/react';
import {motion} from 'framer-motion';
import {Suspense} from 'react';
import {CheckCircleIcon, BookmarkIcon, HeartIcon} from '@heroicons/react/24/outline';
import {CheckCircleIcon as SolidCheckCircleIcon, BookmarkIcon as SolidBookmarkIcon, HeartIcon as SolidHeartIcon} from '@heroicons/react/24/solid';
import {YemSpinner} from './yem-spinner.js';
import {buildImgSource} from '~/utils/build-cloudflare-image-source.js';

type ClassCardPropierties = {
	readonly course: Record<string, any>;
	readonly to: string;
};

type GenericEntityCardPropierties = ClassCardPropierties & {
	readonly activity: Promise<{
		data: {
			totalLessons: number | undefined;
			completedLessons: number | undefined;
			percentage: number | undefined;
		};
	} | undefined> | undefined;
};

type LessonEntityCardPropierties = ClassCardPropierties & {
	readonly activity: Promise<{
		data: {
			saved: boolean | undefined;
			completed: boolean | undefined;
			favorited: boolean | undefined;
		};
	}> | undefined;
};

export function AdminEntityCard({course, to}: ClassCardPropierties) {
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
				<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 py-2 px-3 flex flex-col justify-between'>
					<h2 className='text-mauve-3 text-sm drop-shadow-md'>
						{course.name}
					</h2>
					<div>
						<p className='text-mauve-5 text-xs text-ellipsis line-clamp-3'>{course.description}</p>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

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
				<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 py-2 px-3 flex flex-col justify-between'>
					<h2 className='text-mauve-3 text-sm drop-shadow-md'>
						{course.name}
					</h2>
					<div>
						<p className='text-mauve-5 text-xs text-ellipsis line-clamp-3'>{course.description}</p>
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={activity}>
								{activity => (
									activity?.data.percentage !== undefined && (
										<div className='flex justify-end'>
											<div className='flex gap-3 p-1 bg-mauvea-10 rounded-xl'>
												<div className='flex gap-1 items-center'>
													{activity.data.percentage === 100 ? <SolidCheckCircleIcon className='size-4 stroke-purple-11 fill-purple-11'/> : <CheckCircleIcon className='size-4'/>}
													<p className='text-mauve-5 text-xs text-nowrap'>
														{`${activity.data.percentage} %`}
													</p>
												</div>
											</div>
										</div>
									)
								)}
							</Await>
						</Suspense>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

export function LessonEntityCard({course, to, activity}: LessonEntityCardPropierties) {
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
				<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 py-2 px-3 flex flex-col justify-between'>
					<h2 className='text-mauve-3 text-sm drop-shadow-md'>
						{course.name}
					</h2>
					<div>
						<p className='text-mauve-5 text-xs text-ellipsis line-clamp-3'>{course.description}</p>
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={activity}>
								{activity => activity?.data.completed !== undefined && (
									<div className='flex justify-end'>
										<div className='flex gap-3 items-center w-fit p-1 bg-mauvea-10 rounded-xl'>
											{activity.data.completed ? <SolidCheckCircleIcon className='size-4 stroke-purple-11 fill-purple-11'/> : <CheckCircleIcon className='size-4'/>}
											{activity.data.saved ? <SolidBookmarkIcon className='size-4 stroke-purple-11 fill-purple-11'/> : <BookmarkIcon className='size-4'/>}
											{activity.data.favorited ? <SolidHeartIcon className='size-4 stroke-purple-11 fill-purple-11'/> : <HeartIcon className='size-4'/>}
										</div>
									</div>
								)}
							</Await>
						</Suspense>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}
