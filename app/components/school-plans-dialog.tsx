import {
	XMarkIcon,
	CheckCircleIcon,
	HeartIcon,
	BookmarkIcon,
	VideoCameraIcon,
	PlayIcon,
	UserGroupIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';

type SchoolPlansDialogProperties = {
	readonly isOpen: boolean;
	readonly onOpenChange: (open: boolean) => void;
};

export default function SchoolPlansDialog({isOpen, onOpenChange}: SchoolPlansDialogProperties) {
	return (
		<Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

				<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-4 max-w-screen-lg w-[90%] bg-mauve-2 dark:bg-mauvedark-2 rounded-xl overflow-y-auto max-h-[90%]'>
					<h1>Escolha seu plano e comece agora mesmo:</h1>

					<div className='flex justify-center gap-8'>
						<div className='basis-80 p-4 bg-purplea-4 rounded-2xl'>
							<h3>Mensal</h3>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>7 Dias Gratuitos</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Cancele quando quiser</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Mais de 1.500 aulas</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Aulas Teóricas</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Treinos de Respiratórios</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Treinos de Ásanas</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Treinos de Meditação</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Treinos de Relaxamento</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Suporte com Professores</p>
							</div>
						</div>

						<div className='basis-80 p-4 bg-purplea-4 rounded-2xl'>
							<h3>Anual</h3>

							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Todos Benefícios do Plano Mensal</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Alimentação Vegetariana</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Anatomia Aplicada ao Yoga</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Caminhos para Orgasmo e Feminilidade</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Congresso Semana Sem Carnes</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Culinária Vegetariana</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Jejum Intermitente</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso A Respiração do Yoga</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Saúde e Longevidade</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Sámkhya</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Yoga Sutra de Patáñjali</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Yoga e Hinduismo</p>
							</div>
							<div className='flex justify-start gap-1 items-center mb-1'>
								<CheckCircleIcon className='size-4 stroke-grass-10 shrink-0'/>
								<p>Curso Saúde Através do Yoga</p>
							</div>
						</div>
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
