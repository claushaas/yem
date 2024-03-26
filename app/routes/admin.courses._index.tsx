import {XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import {json, type LoaderFunctionArgs} from '@remix-run/node';
import {Link, useLoaderData} from '@remix-run/react';
import {Image} from '@unpic/react';
import {CourseService} from '#/services/course.service';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {getUserSession} from '~/utils/session.server.js';
import {logger} from '#/utils/logger.util.js';
import {buildImgSource} from '~/utils/build-image-source.js';

export const loader = async ({request}: LoaderFunctionArgs) => {
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
		<>
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
			<div className='flex gap-4 my-4'>
				{courses?.map(course => (
					<div key={course.id} className='portrait:w-48 w-80 portrait:h-80 h-48 relative'>
						<Image
							className='absolute top-0 left-0 w-full h-full rounded-xl -z-10'
							src={buildImgSource('78c0c3ab-7da6-46e8-742e-fd0e4b08b900')}
							cdn='cloudflare_images'
							layout='constrained'
							width={320}
							height={320}
							alt='Mulher praticando Yoga'
						/>
						<Link to={`./${course.id}`}>
							<div className='absolute top-0 left-0 h-full w-full rounded-xl bg-mauvea-10 p-4'>
								<h2 className='text-mauve-3'>
									{course.name}
								</h2>
								<p className='text-mauve-5'>{course.description}</p>
							</div>
						</Link>
					</div>
				))}
			</div>
		</>
	);
}
