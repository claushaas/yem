import { Testimony } from '~/components/testimony-card.js';

export function Testimonies() {
	return (
		<section className="mx-auto max-w-max my-20 sm:my-40" id="testimonies">
			<div className="px-4 pb-4 flex gap-4 overflow-x-scroll">
				<Testimony
					description="Professora de Yoga formada pelo Yoga em Movimento"
					name="Mylene Castro"
					videoId="043374c6d38f107762418b0f26f5b251"
				/>
				<Testimony
					description="Pedagoga e Professora de Yoga formada pelo Yoga em Movimento"
					name="Monique Boer"
					videoId="ce784aa01e2f01c02985797aa1a8eb70"
				/>
				<Testimony
					description="Professora de Yoga formada pelo Yoga em Movimento"
					name="Carla Sabiah"
					videoId="758c2bdead209b18e8c77657bdfe964f"
				/>
				<Testimony
					description="Professora de Yoga formada pelo Yoga em Movimento"
					name="Raquel DeFelippo"
					videoId="0c35980f579ac6fe025a645a0b2f93ef"
				/>
				<Testimony
					description="Médico e Aluno do Yoga em Movimento"
					name="Alexandre Garcia"
					videoId="2ce73860379a3a3d503c690ac1323bdb"
				/>
				<Testimony
					description="Aluna do Yoga em Movimento"
					name="Suzana"
					videoId="4236a529569cc65e2cb53aa24b572831"
				/>
			</div>
		</section>
	);
}
