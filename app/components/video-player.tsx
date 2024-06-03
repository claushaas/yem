import {MediaPlayer, MediaProvider, Poster} from '@vidstack/react';
import {defaultLayoutIcons, DefaultVideoLayout} from '@vidstack/react/player/layouts/default';

type VideoPlayerProperties = {
	readonly title: string;
	readonly src: string;
	readonly alt: string;
};

export function VideoPlayer({title, src, alt}: VideoPlayerProperties) {
	return (
		<MediaPlayer playsInline title={title} src={src}>
			<MediaProvider>
				<Poster
					className='vds-poster'
					src='https://d1k8tin4cdb6jb.cloudfront.net/video_poster.jpg'
					alt={alt}
				/>
			</MediaProvider>
			<DefaultVideoLayout icons={defaultLayoutIcons}/>
		</MediaPlayer>
	);
}
