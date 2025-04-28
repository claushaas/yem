import * as RadixForm from '@radix-ui/react-form';
import {
	Form,
	type LoaderFunctionArgs,
	type MetaArgs,
	useActionData,
	useNavigation,
} from 'react-router';
import { populateCache } from '~/cache/initial-cache-population.js';
import { SuccessOrErrorMessage } from '~/components/admin-success-or-error-message.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { logger } from '~/utils/logger.util';

type TActionData = {
	error: string | undefined;
	success: string | undefined;
};

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento - Área Administrativa - Repopular Cache' },
	{
		content:
			'Área para executar as funções administrativas e pedagógicas do Yoga em Movimento.',
		name: 'description',
	},
	{ content: 'noindex, nofollow', name: 'robots' },
	...data!.meta,
];

export const loader = ({ request }: LoaderFunctionArgs) => ({
	meta: [
		{
			href: new URL('/admin/repopulate-cache', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	],
});

export const action = async () => {
	try {
		await populateCache();
		return { error: undefined, success: 'Cache repopulado com sucesso' };
	} catch (error) {
		logger.logError(
			`Error in AdminRepopulateCache: ${(error as Error).message}`,
		);
		return {
			error: `Erro ao repopular o cache: ${(error as Error).message}`,
			success: undefined,
		};
	}
};

export default function AdminRepopulateCache() {
	const navigation = useNavigation();
	const isSubmittingAnyForm =
		navigation.formAction === '/admin/repopulate-cache';

	const actionData = useActionData<TActionData>();
	const success = actionData?.success;
	const error = actionData?.error;

	return (
		<>
			<SuccessOrErrorMessage error={error} success={success} />

			<RadixForm.Root asChild>
				<Form action="/admin/repopulate-cache" method="post">
					<RadixForm.Submit asChild>
						<Button
							className="m-auto mt-2"
							isDisabled={isSubmittingAnyForm}
							preset={ButtonPreset.Primary}
							text="Repopular o Cache"
							type={ButtonType.Submit}
						/>
					</RadixForm.Submit>
				</Form>
			</RadixForm.Root>
		</>
	);
}
