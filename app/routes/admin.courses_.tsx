/* eslint-disable @typescript-eslint/naming-convention */
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	unstable_defineLoader as defineLoader,
	unstable_defineAction as defineAction,
	unstable_data as data,
} from '@remix-run/node';
import {type MetaArgs_SingleFetch, useLoaderData} from '@remix-run/react';
import {CourseService} from '~/services/course.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server.js';
import {logger} from '~/utils/logger.util.js';
import {type TUserRoles} from '~/types/user.type';
import {type TCourse} from '~/types/course.type';
import {CourseCreateOrEditForm} from '~/components/course-create-or-edit-form.js';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';
import {AdminEntityCard} from '~/components/entities-cards.js';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => ([
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Cursos oferecidos pela Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const courses = await new CourseService().getAll(userSession.get('roles') as TUserRoles);

		return data(
			{
				error: userSession.get('error') as string | undefined,
				success: userSession.get('success') as string | undefined,
				courses,
				meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/courses', request.url).toString()}],
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	} catch (error) {
		logger.logDebug(`Error getting courses: ${(error as Error).message}`);
		return data(
			{
				courses: undefined,
				success: undefined,
				error: `Error getting courses: ${(error as Error).message}`,
				meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/courses', request.url).toString()}],
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	}
});

export const action = defineAction(async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			const newCourse: TCourse = {
				oldId: formData.get('oldId') as string,
				name: formData.get('name') as string,
				description: formData.get('description') as string,
				content: formData.get('content') as string,
				marketingContent: formData.get('marketingContent') as string,
				videoSourceUrl: formData.get('videoSourceUrl') as string,
				marketingVideoUrl: formData.get('marketingVideoUrl') as string,
				thumbnailUrl: formData.get('thumbnailUrl') as string,
				publicationDate: new Date(formData.get('publicationDate') as string),
				isPublished: Boolean(formData.get('isPublished')),
				isSelling: Boolean(formData.get('isSelling')),
				delegateAuthTo: (formData.get('delegateAuthTo') as string).split(','),
				order: Number(formData.get('order')),
			};

			await new CourseService().create(newCourse);

			userSession.flash('success', `Curso ${newCourse.name} criado com sucesso`);
		} else {
			userSession.flash('error', 'Você não tem permissão para criar cursos');
		}
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', 'Erro ao criar curso');
	}

	return data({}, {status: 303, headers: {'Set-Cookie': await commitUserSession(userSession)}});
});

export default function Courses() {
	const {
		courses,
		error,
		success,
	} = useLoaderData<typeof loader>();

	return (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<div className='flex items-center gap-5'>
				<h1>Cursos</h1>
				<CourseCreateOrEditForm/>
			</div>

			<div className='flex gap-4 my-4 flex-wrap'>
				{courses?.data?.map(course => (
					<AdminEntityCard key={course?.id} course={course ?? {}} to={`./${course?.slug}`}/>
				))}
			</div>
		</>
	);
}
