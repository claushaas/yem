import {Image} from '@unpic/react';
import {buildImgSource} from '~/utils/build-cloudflare-image-source.js';

type PlaylistCardProperties = {
	readonly title: string;
	readonly image: string;
};

export function PlaylistCard({title, image}: PlaylistCardProperties) {
	return (
		<div className='shrink-0 bg-mauve-10 rounded-3xl px-2 py-5 -z-20 w-64 h-80 relative flex items-center shadow-xs shadow-mauve-11'>
			<Image
				className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
				src={buildImgSource(image)}
				cdn='cloudflare_images'
				layout='constrained'
				width={256}
				height={320}
				alt={title}
			/>
			<h3 className='text-white text-4xl'>{title}</h3>
		</div>
	);
}
