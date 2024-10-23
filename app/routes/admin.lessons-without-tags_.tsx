import {type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {AdminEntityCard} from '~/components/entities-cards';
import {LessonService} from '~/services/lesson.service.server';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const user = userSession.data as TypeUserSession;

	const lessons = await new LessonService().getLessonsWithoutTags(user);

	return {
		lessons,
	};
};

export default function LessonsWithoutTags() {
	const {lessons} = useLoaderData<typeof loader>();

	return (
		<>
			<div>
				<h1>Aulas sem Tags</h1>
			</div>

			<div className='flex gap-4 my-4 flex-wrap'>
				{lessons.data.map(lesson => (
					<AdminEntityCard key={lesson.id} course={lesson ?? {}} to={`./${lesson.slug}`}/>
				))}
			</div>
		</>
	);
}
