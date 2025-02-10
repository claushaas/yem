import * as Dialog from '@radix-ui/react-dialog';
import {Stream} from '@cloudflare/stream-react';
import {PlayIcon, XMarkIcon} from '@heroicons/react/24/outline';

type TestimonyProperties = {
	readonly name: string;
	readonly description: string;
	readonly videoId: string;
};

export function Testimony({
	name,
	description,
	videoId,
}: TestimonyProperties) {
	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<div className='shrink-0 w-56 sm:w-72 h-48 sm:h-60 p-4 sm:p-6 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 hover:cursor-pointer flex flex-col justify-center gap-2'>
					<h1 className='text-center text-xl'>{name}</h1>
					<p className='text-center italic'>{description}</p>
					<PlayIcon className='size-10 mx-auto'/>
				</div>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='bg-mauvea-12 fixed inset-0'/>

				<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-3 w-[98%] sm:p-10 sm:w-[600px] lg:w-[850px] xl:w-[1000px] bg-mauve-2 dark:bg-mauvedark-2 rounded-3xl flex flex-col justify-center gap-8'>
					<div>
						<Dialog.Title asChild>
							<h1>{name}</h1>
						</Dialog.Title>
						<Dialog.Description asChild>
							<p className='italic'>{description}</p>
						</Dialog.Description>
					</div>
					<div className='h-fit'>
						<Stream
							controls
							autoplay
							preload='auto'
							className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
							src={videoId}
							responsive={false}
						/>
					</div>
					<Dialog.Close asChild>
						<button
							type='button'
							className='absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center outline-hidden'
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
