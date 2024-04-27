import {
	type ActionFunctionArgs, json, type LoaderFunctionArgs,
} from '@remix-run/node';
import {
	Form, type MetaFunction, redirect, useLoaderData, useNavigation,
} from '@remix-run/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {useEffect, useState} from 'react';
import {TagService} from '~/services/tag.service.server';
import {type TServiceReturn} from '~/types/service-return.type';
import {type TTag, type TPrismaPayloadGetAllTags} from '~/types/tag.type';
import {logger} from '~/utils/logger.util';
import {commitUserSession, getUserSession} from '~/utils/session.server';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {YemSpinner} from '~/components/yem-spinner.js';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';

export const meta: MetaFunction<typeof loader> = ({data}) => ([
	{title: 'Tags - Yoga em Movimento'},
	{name: 'description', content: 'Página de tags do Yoga em Movimento'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
]);

type TagsLoaderData = {
	error: string | undefined;
	success: string | undefined;
	tags: TServiceReturn<TPrismaPayloadGetAllTags> | undefined;
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const loader = async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{tagName: 'link', rel: 'canonical', href: new URL('/admin/tags', request.url).toString()},
	];

	try {
		const tags = await new TagService().getAll();

		return json<TagsLoaderData>({
			error: userSession.get('error') as string | undefined,
			success: userSession.get('success') as string | undefined,
			tags,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error getting all tags: ${(error as Error).message}`);
		return json<TagsLoaderData>({
			tags: undefined,
			error: `Error getting all tags: ${(error as Error).message}`,
			success: undefined,
			meta,
		}, {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const formData = await request.formData();

	try {
		const tagData = [
			formData.get('tagOption') as string,
			formData.get('tagName') as string,
		] as TTag;

		await new TagService().create(tagData);

		userSession.flash('success', `Tag ${tagData[0]} - ${tagData[1]} criada com sucesso!`);

		return redirect('/admin/tags', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	} catch (error) {
		logger.logError(`Error creating tag: ${(error as Error).message}`);
		userSession.flash('error', `Error creating tag: ${(error as Error).message}`);

		return redirect('/admin/tags', {
			headers: {
				'Set-Cookie': await commitUserSession(userSession), // eslint-disable-line @typescript-eslint/naming-convention
			},
		});
	}
};

export default function Tags() {
	const {
		tags,
		error,
		success,
	} = useLoaderData<TagsLoaderData>();

	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/admin/tags';

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (success ?? error) {
			setOpen(false);
		}
	}, [success, error]);

	return (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<div className='flex items-center gap-5'>
					<h1>Tags</h1>
					<Dialog.Trigger asChild>
						<div>
							<Button preset={ButtonPreset.Primary} type={ButtonType.Button} text='Adicionar Nova Tag'/>
						</div>
					</Dialog.Trigger>
				</div>

				<Dialog.Portal>
					<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

					<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
						<Dialog.Title asChild>
							<h1 className='mb-4'>
								Adicionar Nova Tag
							</h1>
						</Dialog.Title>

						<RadixForm.Root asChild>
							<Form method='post' action='/admin/tags' className='flex flex-col gap-3'>
								<RadixForm.Field name='tagOption'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>Tag Option</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											required
											disabled={isSubmitting}
											type='text'
											min={3}
											className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name='tagName'>
									<div className='flex items-baseline justify-between'>
										<RadixForm.Label>
											<p>Tag Name</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											required
											disabled={isSubmitting}
											type='text'
											min={3}
											className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Submit asChild>
									<Button isDisabled={isSubmitting} className='m-auto mt-2' text='Criar Tag' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
								</RadixForm.Submit>

								{isSubmitting && <YemSpinner/>}
							</Form>
						</RadixForm.Root>

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

			<div className='flex gap-4 my-4 flex-col'>
				{tags?.data.map(tag => (
					<p key={tag.id}>{`${tag.tagOptionName} - ${tag.tagValueName}`}</p>
				))}
			</div>
		</>
	);
}
