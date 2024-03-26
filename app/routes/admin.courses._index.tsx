import {XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {CourseService} from '#/services/course.service';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {getUserSession} from '~/utils/session.server';
import {logger} from '#/utils/logger.util';

export const loader = async ({params, request, context}: LoaderFunctionArgs) => {
	const {data: userData} = await getUserSession(request.headers.get('Cookie'));

	try {
		const response = await new CourseService().getAll(userData.roles as string[] ?? []);
		return json({
			courses: response.data,
		});
	} catch (error) {
		logger.logDebug(`Error getting courses: ${(error as Error).message}`);
		return json({courses: []});
	}
};

export default function Courses() {
	const {courses} = useLoaderData<typeof loader>();
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<div className='w-fit'>
					<Button
						preset={ButtonPreset.Primary}
						text='Adicionar Novo Curso'
						type={ButtonType.Button}
					/>
				</div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 dark:bg-mauvedarka-12 fixed inset-0'/>

				<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-[90%] w-full bg-mauve-2 dark:bg-mauvedark-2 rounded-xl flex flex-col justify-center gap-8'>
					<div>
						<Dialog.Title asChild>
							<h1>Adicionar Novo Curso</h1>
						</Dialog.Title>
					</div>
					<Dialog.Close asChild>
						<button
							type='button'
							className='absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-none'
							aria-label='Close'
						>
							<XMarkIcon aria-label='Close' className='hover:pointer absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px]'/>
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
