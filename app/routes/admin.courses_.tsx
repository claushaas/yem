import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect,
} from '@remix-run/node';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {CourseService} from '~/services/course.service.server';
import {commitUserSession, getUserSession} from '~/utils/session.server.js';
import {logger} from '~/utils/logger.util.js';
import {CourseCard} from '~/components/generic-entity-card.js';
import {type TUserRoles} from '~/types/user.type';
import {type TCourse, type TPrismaPayloadGetAllCourses} from '~/types/course.type';
import {type TServiceReturn} from '~/types/service-return.type';
import {CourseCreateOrEditForm} from '~/components/course-create-or-edit-form.js';

export const meta: MetaFunction<typeof loader> = ({data}) => ([
	{title: 'Cursos - Yoga em Movimento'},
	{name: 'description', content: 'Cursos oferecidos pela Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

export type TCoursesLoaderData = {
	error: string | undefined;
	success: string | undefined;
	courses: TServiceReturn<TPrismaPayloadGetAllCourses> | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const courses = await new CourseService().getAll(userSession.get('roles') as TUserRoles);
		return json<TCoursesLoaderData>({
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
			courses,
			meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/courses', request.url).toString()}],
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logDebug(`Error getting courses: ${(error as Error).message}`);
		return json<TCoursesLoaderData>({
			courses: undefined,
			success: undefined,
			error: `Error getting courses: ${(error as Error).message}`,
			meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/courses', request.url).toString()}],
		});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
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

			return redirect('/admin/courses', {
				headers: {
					'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
				},
			});
		}

		userSession.flash('error', 'Você não tem permissão para criar cursos');
		return redirect('/admin/courses', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', 'Erro ao criar curso');
		return redirect('/admin/courses', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Courses() {
	const {
		courses,
		error,
		success,
	} = useLoaderData<TCoursesLoaderData>();

	return (
		<>
			{(success ?? error) && (
				<p className='mb-4 text-lg'>
					{success ?? error}
				</p>
			)}
			<div className='flex items-center gap-5'>
				<h1>Cursos</h1>
				<CourseCreateOrEditForm/>
			</div>

			<div className='flex gap-4 my-4 flex-wrap'>
				{courses?.data?.map(course => (
					<CourseCard key={course?.id} course={course ?? {}} to={`./${course?.slug}`}/>
				))}
			</div>
		</>
	);
}
