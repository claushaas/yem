import * as RadixForm from '@radix-ui/react-form';
import {
	type ActionFunctionArgs, redirect,
} from '@remix-run/node';
import {Form, Link, useNavigation} from '@remix-run/react';
import {Separator} from '@radix-ui/react-separator';
import {Button, ButtonPreset, ButtonType} from '~/components/button/index.js';
import {yemApiRequest} from '~/utils/request.server';
import {YemSpinner} from '~/components/yem-spinner/index.js';
import {logger} from '#/utils/logger.util';

export const action = async ({request}: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const email = formData.get('email');

		await yemApiRequest.post('/users/new-password', {
			email,
		});

		return redirect('/login');
	} catch (error) {
		logger.logError(`Error generating new password: ${(error as Error).message}`);
		return redirect('/login');
	}
};

export default function NewPassword() {
	const navigation = useNavigation();
	const isSubmitting = navigation.formAction === '/new-password';

	return (
		<main className='flex flex-col flex-grow-[0.6] mt-20'>
			<div className='w-[260px] mx-auto my-auto flex flex-col'>
				<p className='mb-3 text-center'>Para gerar uma nova senha, preencha o seu email de acesso abaixo e envie o formulário. Em poucos instantes você receberá a nova senha no seu email e no seu Whatsapp</p>
				<RadixForm.Form asChild noValidate action='/new-password' method='post' className='w-[260px] mx-auto my-auto flex flex-col'>
					<Form>
						<RadixForm.Field className='grid mb-[10px]' name='email'>
							<div className='flex items-baseline justify-between'>
								<RadixForm.Label className='leading-[35px]'>
									<p>Email</p>
								</RadixForm.Label>
								<RadixForm.Message className='text-[13px]' match='valueMissing'>
									<p>Preencha seu email</p>
								</RadixForm.Message>
								<RadixForm.Message className='text-[13px]' match='typeMismatch'>
									<p>Informe um email válido</p>
								</RadixForm.Message>
							</div>
							<RadixForm.Control asChild>
								<input
									required
									disabled={isSubmitting}
									className='w-full bg-mauve-5 dark:bg-mauvedark-5 text-mauve-12 dark:text-mauvedark-11 inline-flex h-[35px] appearance-none items-center justify-center rounded-md px-[10px] text-[15px] leading-none outline-none'
									type='email'
								/>
							</RadixForm.Control>
						</RadixForm.Field>
						<RadixForm.Submit asChild>
							<Button isDisabled={isSubmitting} className='m-auto' preset={ButtonPreset.Primary} type={ButtonType.Submit} text='Gerar Nova Senha'/>
						</RadixForm.Submit>
						{isSubmitting && (
							<YemSpinner/>
						)}
					</Form>
				</RadixForm.Form>
				<div className='m-3 w-[260px] mx-auto flex justify-center gap-1'>
					<Link to='/login'>
						<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>Fazer login</p>
					</Link>
					<Separator
						decorative
						className='bg-mauve-11 dark:bg-mauvedark-11 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px'
						orientation='vertical'/>
					<Link to='/register'>
						<p className='text-center text-xs text-mauve-11 dark:text-mauvedark-10'>Criar uma conta</p>
					</Link>
				</div>
			</div>
		</main>
	);
}
