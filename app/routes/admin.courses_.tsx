/** biome-ignore-all lint/style/noNonNullAssertion: . */
import {
	type ActionFunctionArgs,
	data,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
} from 'react-router';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { CourseCreateOrEditForm } from '~/components/course-create-or-edit-form.js';
import { AdminEntityCard } from '~/components/entities-cards.js';
import { CourseService } from '~/services/course.service.server';
import type { TCourse } from '~/types/course.type';
import { logger } from '~/utils/logger.util.js';
import { commitUserSession, getUserSession } from '~/utils/session.server.js';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Cursos - Yoga em Movimento' },
	{ content: 'Cursos oferecidos pela Yoga em Movimento', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		const courses = await new CourseService().getAllForUser(
			userSession.get('user'),
		);

		return data(
			{
				courses,
				error: userSession.get('error') as string | undefined,
				meta: [
					{
						href: new URL('/admin/courses', request.url).toString(),
						rel: 'canonical',
						tagName: 'link',
					},
				],
				success: userSession.get('success') as string | undefined,
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
				error: `Error getting courses: ${(error as Error).message}`,
				meta: [
					{
						href: new URL('/admin/courses', request.url).toString(),
						rel: 'canonical',
						tagName: 'link',
					},
				],
				success: undefined,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	}
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	try {
		if ((userSession.get('roles') as string[])?.includes('admin')) {
			const formData = await request.formData();

			const newCourse: TCourse = {
				content: formData.get('content') as string,
				delegateAuthTo: (formData.get('delegateAuthTo') as string).split(','),
				description: formData.get('description') as string,
				isPublished: Boolean(formData.get('isPublished')),
				isSelling: Boolean(formData.get('isSelling')),
				marketingContent: formData.get('marketingContent') as string,
				marketingVideoUrl: formData.get('marketingVideoUrl') as string,
				name: formData.get('name') as string,
				oldId: formData.get('oldId') as string,
				order: Number(formData.get('order')),
				publicationDate: new Date(formData.get('publicationDate') as string),
				thumbnailUrl: formData.get('thumbnailUrl') as string,
				videoSourceUrl: formData.get('videoSourceUrl') as string,
			};

			await new CourseService().create(newCourse);

			userSession.flash(
				'success',
				`Curso ${newCourse.name} criado com sucesso`,
			);
		} else {
			userSession.flash('error', 'Você não tem permissão para criar cursos');
		}
	} catch (error) {
		logger.logError(`Error creating course: ${(error as Error).message}`);
		userSession.flash('error', 'Erro ao criar curso');
	}

	return data(
		{},
		{
			headers: { 'Set-Cookie': await commitUserSession(userSession) },
			status: 303,
		},
	);
};

export default function Courses() {
	const { courses, error, success } = useLoaderData<typeof loader>();

	return (
		<>
			<SuccessOrErrorMessage error={error} success={success} />

			<div className="flex items-center gap-5">
				<h1>Cursos</h1>
				<CourseCreateOrEditForm />
			</div>

			<div className="flex gap-4 my-4 flex-wrap">
				{courses?.data?.map((course) => (
					<AdminEntityCard
						course={course ?? {}}
						key={course?.id}
						to={`./${course?.slug}`}
					/>
				))}
			</div>
		</>
	);
}
