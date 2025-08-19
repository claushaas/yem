/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadixForm from '@radix-ui/react-form';
import { useEffect, useState } from 'react';
import {
	type ActionFunctionArgs,
	data,
	Form,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
	useNavigation,
} from 'react-router';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { YemSpinner } from '~/components/yem-spinner.js';
import { TagService } from '~/services/tag.service.server';
import type { TTag } from '~/types/tag.type';
import { logger } from '~/utils/logger.util';
import { commitUserSession, getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Tags - Yoga em Movimento' },
	{ content: 'Página de tags do Yoga em Movimento', name: 'description' },
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	const meta = [
		{
			href: new URL('/admin/tags', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	];

	try {
		const tags = await new TagService().getAll();

		return data(
			{
				error: userSession.get('error') as string | undefined,
				meta,
				success: userSession.get('success') as string | undefined,
				tags,
			},
			{
				headers: {
					'Set-Cookie': await commitUserSession(userSession),
				},
			},
		);
	} catch (error) {
		logger.logError(`Error getting all tags: ${(error as Error).message}`);

		return data(
			{
				error: `Error getting all tags: ${(error as Error).message}`,
				meta,
				success: undefined,
				tags: undefined,
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
	const formData = await request.formData();

	try {
		const tagData = [
			formData.get('tagOption') as string,
			formData.get('tagName') as string,
		] as TTag;

		await new TagService().create(tagData);

		userSession.flash(
			'success',
			`Tag ${tagData[0]} - ${tagData[1]} criada com sucesso!`,
		);
	} catch (error) {
		logger.logError(`Error creating tag: ${(error as Error).message}`);
		userSession.flash(
			'error',
			`Error creating tag: ${(error as Error).message}`,
		);
	}

	return data(
		{},
		{ headers: { 'Set-Cookie': await commitUserSession(userSession) } },
	);
};

export default function Tags() {
	const { tags, error, success } = useLoaderData<typeof loader>();

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
			<SuccessOrErrorMessage error={error} success={success} />

			<Dialog.Root onOpenChange={setOpen} open={open}>
				<div className="flex items-center gap-5">
					<h1>Tags</h1>
					<Dialog.Trigger asChild>
						<div>
							<Button
								preset={ButtonPreset.Primary}
								text="Adicionar Nova Tag"
								type={ButtonType.Button}
							/>
						</div>
					</Dialog.Trigger>
				</div>

				<Dialog.Portal>
					<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

					<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-lg) w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
						<Dialog.Title asChild>
							<h1 className="mb-4">Adicionar Nova Tag</h1>
						</Dialog.Title>

						<RadixForm.Root asChild>
							<Form
								action="/admin/tags"
								className="flex flex-col gap-3"
								method="post"
							>
								<RadixForm.Field name="tagOption">
									<div className="flex items-baseline justify-between">
										<RadixForm.Label>
											<p>Tag Option</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
											disabled={isSubmitting}
											min={3}
											required
											type="text"
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Field name="tagName">
									<div className="flex items-baseline justify-between">
										<RadixForm.Label>
											<p>Tag Name</p>
										</RadixForm.Label>
									</div>
									<RadixForm.Control asChild>
										<input
											className="w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-hidden"
											disabled={isSubmitting}
											min={3}
											required
											type="text"
										/>
									</RadixForm.Control>
								</RadixForm.Field>

								<RadixForm.Submit asChild>
									<Button
										className="m-auto mt-2"
										isDisabled={isSubmitting}
										preset={ButtonPreset.Primary}
										text="Criar Tag"
										type={ButtonType.Submit}
									/>
								</RadixForm.Submit>

								{isSubmitting && <YemSpinner />}
							</Form>
						</RadixForm.Root>

						<Dialog.Close asChild>
							<button
								aria-label="Close"
								className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-hidden"
								type="button"
							>
								<XMarkIcon
									aria-label="Close"
									className="hover:pointer absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px]"
								/>
							</button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<div className="flex gap-4 my-4 flex-col">
				{tags?.data.map((tag) => (
					<p key={tag.id}>{`${tag.tagOptionName} - ${tag.tagValueName}`}</p>
				))}
			</div>
		</>
	);
}
