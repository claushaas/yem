import {Testimony} from '~/components/testimony-card.js';

export function Testimonies() {
	return (
		<section id='testimonies' className='mx-auto max-w-max my-20 sm:my-32'>
			<div className='px-6 pb-4 flex gap-4 overflow-x-scroll'>
				<Testimony
					name='Mylene Castro'
					description='Professora de Yoga formada pelo Yoga em Movimento'
					videoId='043374c6d38f107762418b0f26f5b251'
				/>
				<Testimony
					name='Monique Boer'
					description='Pedagoga e Professora de Yoga formada pelo Yoga em Movimento'
					videoId='ce784aa01e2f01c02985797aa1a8eb70'
				/>
				<Testimony
					name='Carla Sabiah'
					description='Professora de Yoga formada pelo Yoga em Movimento'
					videoId='758c2bdead209b18e8c77657bdfe964f'
				/>
				<Testimony
					name='Raquel DeFelippo'
					description='Professora de Yoga formada pelo Yoga em Movimento'
					videoId='0c35980f579ac6fe025a645a0b2f93ef'
				/>
				<Testimony
					name='Alexandre Garcia'
					description='Médico e Aluno do Yoga em Movimento'
					videoId='2ce73860379a3a3d503c690ac1323bdb'
				/>
				<Testimony
					name='Suzana'
					description='Aluna do Yoga em Movimento'
					videoId='4236a529569cc65e2cb53aa24b572831'
				/>
			</div>
		</section>
	);
}
