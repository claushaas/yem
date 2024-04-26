import * as RadixForm from '@radix-ui/react-form';
import {type LoaderFunctionArgs, json, type ActionFunctionArgs} from '@remix-run/node';
import {
	Form, type MetaFunction, useActionData, useNavigation,
} from '@remix-run/react';
import {populateCache} from '~/cache/initial-cache-population.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {type TUser} from '~/types/user.type';
import {logger} from '~/utils/logger.util';
import {getUserSession} from '~/utils/session.server';

type TActionData = {
	error: string | undefined;
	success: string | undefined;
};

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Yoga em Movimento - Área Administrativa - Repopular Cache'},
	{name: 'description', content: 'Área para executar as funções administrativas e pedagógicas do Yoga em Movimento.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => json<{meta: Array<{tagName: string; rel: string; href: string}>}>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/repopulate-cache', request.url).toString()}],
});

export const action = async ({request}: ActionFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));
	const {data} = userSession as unknown as {data: TUser};

	if (!data?.roles?.includes('admin')) {
		return json<TActionData>({error: 'Acesso negado', success: undefined});
	}

	try {
		await populateCache();
		return json<TActionData>({error: undefined, success: 'Cache repopulado com sucesso'});
	} catch (error) {
		logger.logError(`Error in AdminRepopulateCache: ${(error as Error).message}`);
		return json<TActionData>({error: `Erro ao repopular o cache: ${(error as Error).message}`, success: undefined});
	}
};

export default function AdminRepopulateCache() {
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === '/admin/repopulate-cache';

	const actionData = useActionData<typeof action>();

	return (
		<>
			{(actionData?.success ?? actionData?.error) && (
				<p className='mb-4 text-lg'>
					{actionData.success ?? actionData.error}
				</p>
			)}
			<RadixForm.Root asChild>
				<Form method='post' action='/admin/repopulate-cache'>
					<RadixForm.Submit asChild>
						<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Repopular o Cache' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
					</RadixForm.Submit>
				</Form>
			</RadixForm.Root>
		</>
	);
}
