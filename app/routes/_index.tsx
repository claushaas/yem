import type {MetaFunction} from '@remix-run/node';
import {Image} from '@unpic/react';
import {buildImgSrc} from '~/utils/buildImgSrc';
import {Testimony} from '~/components/testimony';

export const meta: MetaFunction = () => [
	{title: 'Yoga em Movimento'},
	{name: 'description', content: 'Seja muito bem-vindo à Yoga em Movimento!'},
];

const Index = () => (
	<main>
		<section id='welcome' className='flex max-w-[90%] mx-auto my-20 sm:my-32 py-12 items-start gap-14 justify-center'>
			<div className='sm:max-w-[50%]'>
				<h1 className='text-3xl xs:text-5xl xl:text-7xl text-left mb-4 text-purple-12 dark:text-purpledark-12'>
					Transforme sua vida com a prática do Yoga, onde quer que esteja.
				</h1>
				<h2 className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-11 dark:text-purpledark-11'>
					Bem-vindo ao Yoga em Movimento.
				</h2>
			</div>
			<div>
				<Image
					className='max-sm:hidden'
					src={buildImgSrc('0bccd83e-9399-4753-5093-468094deed00')}
					cdn='cloudflare_images'
					layout='constrained'
					width={400}
					height={400}
					alt='Mulher praticando Yoga'
				/>
			</div>
		</section>
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
		<section id='history' className='my-20 sm:my-32 max-w-[90%] mx-auto flex justify-center'>
			<div className='max-w-screen-md w-full'>
				<h1 className='text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl xl:text-7xl text-left mb-5'>Yoga é para Todas Pessoas!</h1>
				<h2 className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-12 dark:text-purpledark-12 mb-4'>É nisso que acreditamos. E é por isso que existimos.</h2>
				<p className='my-3 font-gothamMedium'>O Yoga em Movimento surgiu em 2010 no interior de São Paulo, do sonho de seus fundadores de espargir esse estilo de vida baseado na saúde e no autoconhecimento para cada vez mais pessoas.</p>
				<p className='my-3 font-gothamMedium'>Para tornar o Yoga acessível para todas pessoas, de qualquer lugar, migramos em 2015 para o formato EAD, para podermos levar essa filosofia de vida a todos os cantos deste planeta.</p>
				<p className='my-3 font-gothamMedium'>Desde então, nossa equipe de professores já formou mais de 1.000 professores. E junto com a Nossa Escola, já são mais de 14.000 alunos espalhados pelo mundo.</p>
			</div>
		</section>
	</main>
);

export default Index;
