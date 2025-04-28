import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import { Link, useLocation } from 'react-router';
import { Button, ButtonPreset, ButtonType } from './button.js';

type SchoolPlansDialogProperties = {
	readonly isOpen: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export default function SchoolPlansDialog({
	isOpen,
	onOpenChange,
}: SchoolPlansDialogProperties) {
	const { search } = useLocation();
	const searchParameters = search ? search.split('?')[1].split('&') : [];
	const marketingSearchParameters = searchParameters.filter((searchParameter) =>
		searchParameter.includes('utm_'),
	);

	return (
		<Dialog.Root onOpenChange={onOpenChange} open={isOpen}>
			<Dialog.Portal>
				<Dialog.Overlay className="bg-mauvea-12 fixed inset-0" />

				<Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-(--breakpoint-md) w-[99%] xs:w-[95%] sm:w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]">
					<div className="flex flex-col gap-5 items-center">
						<h1 className="text-center">
							Escolha seu plano e comece agora mesmo:
						</h1>

						<div className="flex justify-center gap-8 flex-wrap">
							<div className="basis-80 p-4 bg-purplea-4 rounded-2xl shadow-xs shadow-purple-12 dark:shadow-purpledark-12 flex flex-col justify-around">
								<div>
									<h2 className="text-center">Mensal</h2>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>7 Dias Gratuitos</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Cancele quando quiser</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Mais de 1.500 aulas</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Aulas Teóricas</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Treinos de Respiratórios</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Treinos de Ásanas</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Treinos de Meditação</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Treinos de Relaxamento</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Suporte com Professores</p>
									</div>
								</div>

								<div className="flex justify-center flex-col items-center gap-3">
									<p>R$ 77,00/mês</p>
									<Link
										target="_blank"
										to={`https://pay.hotmart.com/Y5414825L?off=z0k6km14&hideBillet=1&hidePix=1&showOnlyTrial=1&${marketingSearchParameters.join('&')}`}
									>
										<Button
											preset={ButtonPreset.Secondary}
											text="Assinar"
											type={ButtonType.Button}
										/>
									</Link>
									<p className="text-xs">
										7 dias grátis - cancele quando quiser
									</p>
								</div>
							</div>

							<div className="basis-80 p-4 bg-purplea-4 rounded-2xl shadow-xs shadow-purple-12 dark:shadow-purpledark-12 flex flex-col justify-around gap-5">
								<div>
									<h1 className="text-center">Anual</h1>

									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Todos Benefícios do Plano Mensal</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Alimentação Vegetariana</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Anatomia Aplicada ao Yoga</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Caminhos para Orgasmo e Feminilidade</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Congresso Semana Sem Carnes</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Culinária Vegetariana</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Jejum Intermitente</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso A Respiração do Yoga</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Saúde e Longevidade</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Sámkhya</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Yoga Sutra de Patáñjali</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Yoga e Hinduismo</p>
									</div>
									<div className="flex justify-start gap-1 items-center mb-1">
										<CheckCircleIcon className="size-4 stroke-grass-10 shrink-0" />
										<p>Curso Saúde Através do Yoga</p>
									</div>
								</div>

								<div className="flex justify-center flex-col items-center gap-3">
									<div className="text-center">
										<p className="text-2xl font-gothamMedium">
											12 x R$ 41,42/mês
										</p>
										<p className="text-xs">pago anualmente</p>
										<p>ou R$ 497,00 por ano</p>
									</div>
									<Link
										target="_blank"
										to={`https://pay.hotmart.com/Y5414825L?off=0dc69b6z&hideBillet=1&hidePix=1&showOnlyTrial=1&${marketingSearchParameters.join('&')}`}
									>
										<Button
											preset={ButtonPreset.Primary}
											text="Assinar Agora"
											type={ButtonType.Button}
										/>
									</Link>
									<p className="text-xs">
										7 dias grátis - cancele quando quiser
									</p>
								</div>
							</div>
						</div>

						<div>
							<p className="text-xs">
								Para outras formas de pagamento, entre em contato em nosso{' '}
								<Link target="_blank" to="https://wa.me/551149359150">
									WhatsApp (11) 4935-9150
								</Link>
							</p>
						</div>
					</div>

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
	);
}
