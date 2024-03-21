import * as Dialog from '@radix-ui/react-dialog';
import {Stream} from '@cloudflare/stream-react';
import {PlayIcon} from '@heroicons/react/24/outline';

type TestimonyProps = {
	name: string;
	description: string;
	videoId: string;
};

export const Testimony = ({
	name,
	description,
	videoId,
}: TestimonyProps) => (
	<Dialog.Root>
		<Dialog.Trigger asChild>
			<div className='flex-shrink-0 w-56 sm:w-72 h-48 sm:h-60 p-4 sm:p-6 rounded-md shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 hover:cursor-pointer flex flex-col justify-center gap-2'>
				<h1 className='text-center text-xl'>{name}</h1>
				<p className='text-center italic'>{description}</p>
				<PlayIcon className='size-10 mx-auto' />
			</div>
		</Dialog.Trigger>

		<Dialog.Portal>

			<Dialog.Overlay className='bg-mauvea-12 dark:bg-mauvedarka-12 fixed inset-0' />

			<Dialog.Content className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] p-10 bg-mauve-2 dark:bg-mauvedark-2 rounded-xl flex flex-col justify-center gap-8'>
				<div>
					<Dialog.Title asChild>
						<h1>{name}</h1>
					</Dialog.Title>
					<Dialog.Description asChild>
						<p className='italic'>{description}</p>
					</Dialog.Description>
				</div>
				<div>
					<Stream
						src={videoId}
						controls
						autoplay
					/>
				</div>
			</Dialog.Content>

		</Dialog.Portal>
	</Dialog.Root>
);
