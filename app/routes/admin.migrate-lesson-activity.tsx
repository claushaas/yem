import * as RadixForm from '@radix-ui/react-form';
import {
	type LoaderFunctionArgs, Form, type MetaArgs, useActionData, useNavigation,
} from 'react-router';
import {SuccessOrErrorMessage} from '~/components/admin-success-or-error-message.js';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {MigrationService} from '~/services/migration.service.server';
import {logger} from '~/utils/logger.util';

type TActionData = {
	error: string | undefined;
	success: string | undefined;
};

export const meta = ({data}: MetaArgs<typeof loader>) => [
	{title: 'Yoga em Movimento - Área Administrativa - Migrar Atividade de Aulas'},
	{name: 'description', content: 'Área para executar as funções administrativas e pedagógicas do Yoga em Movimento.'},
	{name: 'robots', content: 'noindex, nofollow'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/admin/migrate-lesson-activity', request.url).toString()}],
});

export const action = async () => {
	try {
		await new MigrationService().getUsers();
		return {error: undefined, success: 'Atividade Migrada com sucesso'};
	} catch (error) {
		logger.logError(`Error in Activity Migration: ${(error as Error).message}`);
		return {error: `Erro ao migrar a atividade de aulas: ${(error as Error).message}`, success: undefined};
	}
};

export default function AdminRepopulateCache() {
	const navigation = useNavigation();
	const isSubmittingAnyForm = navigation.formAction === '/admin/migrate-lesson-activity';

	const actionData = useActionData<TActionData>();
	const success = actionData?.success;
	const error = actionData?.error;

	return (
		<>
			<SuccessOrErrorMessage success={success} error={error}/>

			<RadixForm.Root asChild>
				<Form method='post' action='/admin/migrate-lesson-activity'>
					<RadixForm.Submit asChild>
						<Button isDisabled={isSubmittingAnyForm} className='m-auto mt-2' text='Migrar atividade das aulas' preset={ButtonPreset.Primary} type={ButtonType.Submit}/>
					</RadixForm.Submit>
				</Form>
			</RadixForm.Root>
		</>
	);
}
