import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import {
	DefaultVideoLayout,
	defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';

type VideoPlayerProperties = {
	readonly title: string;
	readonly src: string;
	readonly alt: string;
};

export function VideoPlayer({ title, src, alt }: VideoPlayerProperties) {
	return (
		<MediaPlayer playsInline src={src} title={title}>
			<MediaProvider>
				<Poster
					alt={alt}
					className="vds-poster"
					src="https://d1k8tin4cdb6jb.cloudfront.net/video_poster.jpg"
				/>
			</MediaProvider>
			<DefaultVideoLayout icons={defaultLayoutIcons} />
		</MediaPlayer>
	);
}
