import {Stream} from '@cloudflare/stream-react';
import {
	type LoaderFunctionArgs, type MetaArgs, useLoaderData, Await, useLocation, useNavigate,
} from 'react-router';
import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';
import {type OpIterator} from 'quill/core';
import {Suspense, useState} from 'react';
import {AdjustmentsHorizontalIcon} from '@heroicons/react/24/outline';
import {motion} from 'motion/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';
import {type TLessonDataForCache} from '~/cache/populate-lessons-to-cache.js';
import {LessonEntityCard} from '~/components/entities-cards.js';
import {ModuleService} from '~/services/module.service.server';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';
import {Pagination} from '~/components/pagination.js';
import {Breadcrumbs} from '~/components/breadcrumbs.js';
import {CourseService} from '~/services/course.service.server';
import {VideoPlayer} from '~/components/video-player.js';
import {LessonActivityService} from '~/services/lesson-activity.service.server';
import {YemSpinner} from '~/components/yem-spinner.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {NavigateBar} from '~/components/navigation-bar.js';
import {TagService} from '~/services/tag.service.server';
import {Button, ButtonPreset, ButtonType} from '~/components/button';

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: data!.module?.module.name ?? 'Módulo do Curso do Yoga em Movimento'},
	{name: 'description', content: data!.module?.module.description ?? 'Conheça o módulo do curso oferecido pela Yoga em Movimento'},
	...data!.meta,
];

export const loader = async ({request, params}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const {
		'course-slug': courseSlug,
		'module-slug': moduleSlug,
	} = params;

	const url = new URL(request.url);

	const appliedTags = [...url.searchParams.entries()].filter(([key]) => key === 'Duração' || key === 'Dificuldade' || key === 'Técnicas' || key === 'Ênfase' || key === 'Professor');

	const pageString = url.searchParams.get('page');
	const page = (pageString && !Number.isNaN(pageString)) ? Number(pageString) : 1;

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL(`/courses/${courseSlug}/${moduleSlug}`, request.url).toString()},
	];

	try {
		const lessonActivityService = new LessonActivityService();
		const {data: module} = new ModuleService().getBySlugFromCache(courseSlug!, moduleSlug!, userSession.data as TUser, appliedTags, page);
		const {data: course} = new CourseService().getBySlugFromCache(courseSlug!, userSession.data as TUser);
		const {data: tags} = new TagService().getTagsFromCache();

		const moduleActivity = lessonActivityService.getModuleProgressForUser(moduleSlug!, (userSession.data as TUser).id);
		const lessonsActivity = module?.lessons.map(lesson => ({
			[(lesson as TLessonDataForCache).lesson.slug]: lessonActivityService.getLessonActivityForUser((lesson as TLessonDataForCache).lesson.slug, (userSession.data as TUser).id),
		}));

		return {
			module,
			moduleActivity,
			lessonsActivity,
			meta,
			tags,
			actualPage: page,
			course: {
				slug: course?.slug ?? '',
				name: course?.name ?? '',
			},
			userData: userSession.data as TypeUserSession,
		};
	} catch (error) {
		logger.logError(`Error loading module: ${(error as Error).message}`);
		return {
			module: undefined,
			moduleActivity: undefined,
			lessonsActivity: undefined,
			meta,
			tags: undefined,
			actualPage: page,
			course: undefined,
			userData: userSession.data as TypeUserSession,
		};
	}
};

export default function Module() {
	const {module, actualPage, course, moduleActivity, lessonsActivity, userData, tags} = useLoaderData<typeof loader>();

	const navigate = useNavigate();
	const {search} = useLocation();

	const queriesArray = decodeURI(search).slice(1).split('&').filter(query => !query.includes('page') && query !== '');

	const [filterQueries, setFilterQueries] = useState(queriesArray);
	const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

	const {ops} = module?.module.content ? JSON.parse(module?.module.content) as OpIterator : {ops: []};
	const contentConverter = new QuillDeltaToHtmlConverter(ops, {
		multiLineParagraph: false,
	});

	const onFilterChange = (query: string, state: boolean) => {
		if (state) {
			setFilterQueries([...filterQueries, query]);
		} else {
			setFilterQueries(filterQueries.filter(filterQuery => filterQuery !== query));
		}
	};

	const onAplyFilters = async () => {
		const newQueries = filterQueries.map(query => `&${query}`).join('');
		setIsFilterMenuOpen(false);
		await navigate(`/courses/${course!.slug}/${module!.moduleSlug}?page=${actualPage ?? 1}${newQueries}`);
	};

	return module && (
		<>
			<NavigateBar userData={userData}/>

			<main className='w-full max-w-[95%] sm:max-w-[90%] mx-auto'>
				<Breadcrumbs data={[
					[`/courses/${course.slug}`, course.name], // Course
					[`/courses/${course.slug}/${module.moduleSlug}`, module.module.name], // Module
				]}/>
				<div className='w-full max-w-screen-lg mx-auto'>

					{module.module.videoSourceUrl && (
						<section id='video' className='h-fit rounded-2xl mb-10'>
							{!module.module.videoSourceUrl.startsWith('https://') && (
								<Stream
									controls
									preload='auto'
									className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
									src={module.module.videoSourceUrl}
									responsive={false}
								/>
							)}
							{module.module.videoSourceUrl.startsWith('https://') && (
								<VideoPlayer
									title={module.module.name}
									src={module.module.videoSourceUrl}
									alt={module.module.name}
								/>
							)}
						</section>
					)}

					<section id='content' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6 mb-10'>
						{module.module.content && (
						// eslint-disable-next-line react/no-danger, @typescript-eslint/naming-convention
							(<section dangerouslySetInnerHTML={{__html: contentConverter.convert()}}/>)
						)}
						<Suspense fallback={<YemSpinner/>}>
							<Await resolve={moduleActivity}>
								{({data: {percentage}}) => (
									<p className='text-sm'>Progresso do módulo: {percentage}% concluído</p>
								)}
							</Await>
						</Suspense>
					</section>

					<section id='lessons' className='p-1 sm:p-5 bg-mauvea-2 dark:bg-mauvedarka-2 rounded-2xl flex flex-col gap-6'>
						<div className='flex gap-5 justify-between items-center'>
							<h2 className='text-center'>Aulas</h2>

							{tags && tags.length > 0 && module.module.showTagsFilters && (
								<DropdownMenu.Root open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
									<DropdownMenu.Trigger asChild>
										<motion.div
											className='flex gap-3 items-center bg-mauve-6 dark:bg-mauvedark-6 h-fit px-3 py-2 rounded-xl shadow-sm shadow-mauve-10 dark:shadow-mauvedark-10 cursor-pointer'
											whileHover={{
												scale: 1.05,
												transition: {
													duration: 0.5,
												},
											}}
										>
											<p>Filtros</p>
											<AdjustmentsHorizontalIcon className='size-4'/>
										</motion.div>
									</DropdownMenu.Trigger>

									<DropdownMenu.Portal>
										<DropdownMenu.Content
											align='end'
											sideOffset={5}
											className='bg-mauve-6 dark:bg-mauvedark-6 p-4 rounded-xl shadow-lg shadow-mauve-12 dark:shadow-mauvedark-12 max-w-64 xs:max-w-80 max-h-[450px] overflow-y-auto'
										>
											<h6 className='mb-4'>Selecione as opções e clique em aplicar filtros:</h6>

											<div className='mb-4'>
												<p className='font-gothamMedium mb-1'>Duração</p>

												<div className='flex gap-3 justify-start items-center mb-2 last:mb-0'>
													<Switch.Root
														className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
														defaultChecked={filterQueries.includes('Duração=1')}
														onCheckedChange={(event => {
															onFilterChange('Duração=1', event);
														})}
													>
														<Switch.Thumb
															className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
														/>
													</Switch.Root>
													<p>Até 30min</p>
												</div>

												<div className='flex gap-3 justify-start items-center mb-2 last:mb-0'>
													<Switch.Root
														className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
														defaultChecked={filterQueries.includes('Duração=2')}
														onCheckedChange={(event => {
															onFilterChange('Duração=2', event);
														})}
													>
														<Switch.Thumb
															className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
														/>
													</Switch.Root>
													<p>De 31min até 50min</p>
												</div>

												<div className='flex gap-3 justify-start items-center mb-2 last:mb-0'>
													<Switch.Root
														className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
														defaultChecked={filterQueries.includes('Duração=3')}
														onCheckedChange={(event => {
															onFilterChange('Duração=3', event);
														})}
													>
														<Switch.Thumb
															className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
														/>
													</Switch.Root>
													<p>De 51min até 1h 10min</p>
												</div>

												<div className='flex gap-3 justify-start items-center mb-2 last:mb-0'>
													<Switch.Root
														className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
														defaultChecked={filterQueries.includes('Duração=4')}
														onCheckedChange={(event => {
															onFilterChange('Duração=4', event);
														})}
													>
														<Switch.Thumb
															className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
														/>
													</Switch.Root>
													<p>Mais que 1h 11min</p>
												</div>
											</div>

											{tags.map(tag => (
												<div key={tag.tagOption} className='mb-4'>
													<p className='font-gothamMedium mb-1'>{tag.tagOption}</p>

													{tag.tagValues.map(tagValue => (
														<div key={tagValue} className='flex gap-3 justify-start items-center mb-2 last:mb-0'>
															<Switch.Root
																className='w-[42px] h-[25px] bg-blacka-6 rounded-full relative shadow-[0_2px_10px] shadow-blacka-4 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black outline-none cursor-default'
																defaultChecked={filterQueries.includes(`${tag.tagOption}=${tagValue}`)}
																onCheckedChange={(event => {
																	onFilterChange(`${tag.tagOption}=${tagValue}`, event);
																})}
															>
																<Switch.Thumb
																	className='block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]'
																/>
															</Switch.Root>
															<p>{tagValue}</p>
														</div>
													))}
												</div>
											))}

											<div className='flex justify-center mt-8'>
												<Button
													type={ButtonType.Button}
													preset={ButtonPreset.Primary}
													text='Aplicar Filtros'
													onClick={onAplyFilters}
												/>
											</div>

											<DropdownMenu.Arrow className='fill-mauve-6 dark:fill-mauvedark-6 border-none stroke-none'/>
										</DropdownMenu.Content>
									</DropdownMenu.Portal>
								</DropdownMenu.Root>
							)}
						</div>

						<div className='flex flex-wrap justify-center gap-4 my-4'>
							{module.lessons.length > 0
								? (module.lessons as unknown as TLessonDataForCache[]).map(lesson => (
									<LessonEntityCard
										key={lesson.lesson.id}
										course={lesson.lesson}
										to={`./${lesson.lesson.slug}`}
										activity={lessonsActivity?.reduce((accumulator, activity) => ({...accumulator, ...activity}), {})[lesson.lesson.slug] ?? undefined}
									/>
								))
								: <p>Nenhuma aula encontrada</p>}
						</div>

						{module.pages > 1 && <Pagination pages={module.pages} actualPage={actualPage}/>}
					</section>

				</div>
			</main>
		</>
	);
}
