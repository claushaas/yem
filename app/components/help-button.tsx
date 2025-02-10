import {ChatBubbleLeftRightIcon, XMarkIcon} from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';

export function HelpButton() {
	return (
		<Dialog.Root>
			<Dialog.Trigger>
				<div className='fixed bottom-5 right-5 z-40 p-2 dark:bg-mauve-2 bg-mauvedark-2 rounded-full shadow-xs shadow-black dark:shadow-white'>
					<ChatBubbleLeftRightIcon className='size-12 stroke-purple-10'/>
				</div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

				<Dialog.Content className='fixed bottom-5 right-5 w-72 p-6 bg-mauve-2 dark:bg-mauvedark-2 z-50 rounded-xl'>
					<Dialog.Title asChild className='mb-4'>
						<h3>Como podemos te ajudar?</h3>
					</Dialog.Title>

					<div>
						<p className='mb-4'>
							Caso precise de ajuda, entre em contato conosco em um de nossos canais de suporte, nos links abaixo:
						</p>
						<div className='flex justify-between gap-4'>
							<button type='button' className='basis-1/2 bg-mauve-5 p-3 dark:bg-mauvedark-5 rounded-xl'>
								<a href='https://t.me/yogaemmovimento_bot' target='_blank' rel='noreferrer'><p>Telegram</p></a>
							</button>
							<button type='button' className='basis-1/2 bg-mauve-5 p-3 dark:bg-mauvedark-5 rounded-xl'>
								<a href='https://wa.me/551149359150' target='_blank' rel='noreferrer'><p>WhatsApp</p></a>
							</button>
						</div>
					</div>

					<Dialog.Close asChild>
						<button
							type='button'
							className='absolute top-[5px] right-[5px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-hidden'
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
