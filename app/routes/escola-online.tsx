import {type LoaderFunctionArgs} from '@remix-run/node';
import {json, type MetaFunction} from '@remix-run/react';
import {
	CheckCircleIcon,
	HeartIcon,
	BookmarkIcon,
	VideoCameraIcon,
	PlayIcon,
	UserGroupIcon,
} from '@heroicons/react/24/outline';
import {Image} from '@unpic/react';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {Testimonies} from '~/layouts/testimonies.js';
import {History} from '~/layouts/yem-history.js';
import {buildImgSource} from '~/utils/build-cloudflare-image-source.js';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Escola Online - Yoga em Movimento'},
	{name: 'description', content: 'A maior escola de Yoga online do Brasil. Com mais de 1500 aulas disponíveis para você praticar onde e quando quiser.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => json<{meta: Array<{tagName: string; rel: string; href: string}>}>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/escola-online', request.url).toString()}],
});

export default function EscolaOnline() {
	return (
		<main>
			<section id='welcome' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-32'>
				<div className='w-full mb-4'>
					<h1 className='xs:text-5xl lg:text-7xl'><span className='text-tomato-11'>A Maior Escola de Yoga do Brasil.</span> <span className='text-pink-11'>Na Hora Você Quiser.</span> <span className='text-purple-11'>Onde Você Estiver.</span></h1>
				</div>
				<div className='mb-6'>
					<h3 className='text-purple-12 dark:text-purple-4'>Viva os benefícios do Yoga para o seu Corpo, Mente e Emoções, e se transforme na Sua Melhor Versão</h3>
				</div>
				<div className='w-fit mx-auto'>
					<Button type={ButtonType.Button} preset={ButtonPreset.Primary} text='Praticar 7 Dias Grátis'/>
					<p className='text-center text-sm'>cancele quando quiser</p>
				</div>
			</section>

			<Testimonies/>

			<History/>

			<section id='platform' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-amber-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>A Plataforma da Yoga em Movimento evoluiu e foi repensada especialmente para a prática do Yoga</h1>
				<div className='flex justify-center gap-4 flex-wrap'>
					<div className='flex flex-col items-center max-w-80'>
						<CheckCircleIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Acompanhe suas aulas assistidas</h2>
					</div>
					<div className='flex flex-col items-center max-w-80'>
						<HeartIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Guarde suas aulas favoritas</h2>
					</div>
					<div className='flex flex-col items-center max-w-80'>
						<BookmarkIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Salve aulas para assistir mais tarde</h2>
					</div>
					<div className='flex flex-col items-center max-w-80'>
						<VideoCameraIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Mais de 1650 aulas práticas</h2>
					</div>
					<div className='flex flex-col items-center max-w-80'>
						<PlayIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Mais de 610.000 reproduções</h2>
					</div>
					<div className='flex flex-col items-center max-w-80'>
						<UserGroupIcon className='size-20 stroke-amber-10'/>
						<h2 className='text-center'>Mais de 15.000 alunos</h2>
					</div>
				</div>
			</section>

			<section id='support' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-sky-12 dark:text-sky-10 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Você sempre terá acompanhamento!</h1>
				<h2 className='text-sky-11 text-2xl xs:text-4xl md:text-5xl lg:text-6xl'>Você pode conversar diretamente com nossos professores pelo whatsapp ou telegram para tirar suas dúvidas</h2>
			</section>

			<section id='duration' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-grass-12 dark:text-grass-11 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Fica fácil inserir o Yoga na sua rotina diária</h1>
				<h2 className='text-grass-9 text-2xl xs:text-4xl md:text-5xl lg:text-6xl'>Pratique em qualquer horário e escolha aula de acordo com o tempo disponível</h2>
				<h2 className='text-grass-9 text-2xl xs:text-4xl md:text-5xl lg:text-6xl'>Aulas de 15 até 90 minutos</h2>
			</section>

			<section id='objectives' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-orange-9 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Alcance seus objetivos no Yoga</h1>

				<div className='my-32'>
					<h2 className='text-orange-11 text-2xl xs:text-4xl'>Filtre as aulas de acordo com sua meta</h2>

					<div className='flex flex-wrap gap-3'>
						<div className='grid grid-rows-[3fr_1fr_1fr_2fr_2fr_3fr] grid-cols-[3fr_1fr_2fr] gap-3 flex-grow basis-80 h-[500px]'>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 col-span-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('dd4a873b-972a-48b7-4c4f-666353046c00')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Flexibilidade'
								/>
								<h3 className='text-white text-[60cqb] @sm:text-[75cqb] @md:text-[100cqb] leading-none break-words w-full'>Força</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('68646074-356d-4ce7-5eba-de3afd57af00')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Flexibilidade'
								/>
								<h3 className='text-white text-[40cqmin] leading-none break-words w-full'>Equilíbrio</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 col-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('91094bcd-1439-4b8b-d762-4ff5b6db0900')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Flexibilidade'
								/>
								<h3 className='text-white text-[40cqmin] leading-none break-words w-full'>Introspecção</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('f77a1f17-1aa4-4966-de10-732db9f2b900')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Purificação'
								/>
								<h3 className='text-white text-[80cqb] @md:text-[100cqb] leading-none break-words w-full'>Restaurativa</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('4dc99a7c-d456-45d9-d787-ef744aea6c00')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Purificação'
								/>
								<h3 className='text-white text-[50cqb] @[15rem]:text-[60cqb] leading-none break-words w-full'>Purificação</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('1f6021aa-333c-4f2b-470f-4349252e2600')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Purificação'
								/>
								<h3 className='text-white text-[30cqb] leading-none break-words w-full'>Respiração</h3>
							</div>
						</div>
						<div className='grid grid-rows-[3fr_1fr_1fr_2fr_2fr_3fr] grid-cols-[2fr_3fr_1fr_2fr] gap-3 flex-grow basis-80 h-[500px]'>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('71e20f1e-2f19-48dc-d1c3-bab403dc4300')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Flexibilidade'
								/>
								<h3 className='text-white text-[50cqb] @[15rem]:text-[60cqb] leading-none break-words w-full'>Meditação</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('289f609f-5233-41f7-445c-838d4c5c0600')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Relaxamento'
								/>
								<h3 className='text-white text-[35cqb] @[10rem]:text-[50cqb] leading-none break-words w-full'>Relaxamento</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-4 col-span-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('a78cfa8f-da25-4b3c-5bfa-1204f404c800')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Flexibilidade'
								/>
								<h3 className='text-white text-[30cqmin] @md:text-[50cqmin] leading-none break-words w-full'>Flexibilidade</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('d95f2201-7e07-4a0b-02b2-b23f8c6ee300')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Vinyasa'
								/>
								<h3 className='text-white text-[45cqmin] leading-none break-words w-full'>Vinyasa</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('dfcb9015-a642-4699-095b-53fabdf84e00')}
									cdn='cloudflare_images'
									layout='constrained'
									width={660}
									height={310}
									alt='Vinyasa'
								/>
								<h3 className='text-white text-[45cqmin] leading-none break-words w-full'>Sem Ásanas</h3>
							</div>
							<div className='bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-sm shadow-mauve-11 @container-[size] flex items-center'>
								<Image
									className='absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10'
									src={buildImgSource('d9d57548-85b0-4362-e6b7-6dc6adbc8e00')}
									cdn='cloudflare_images'
									layout='constrained'
									width={180}
									height={180}
									alt='Vinyasa'
								/>
								<h3 className='text-white text-[30cqmin] leading-none break-words w-full'>Yoga na Cadeira</h3>
							</div>
						</div>
					</div>
				</div>

				<h2>Playlist de aulas prontas e voltadas para objetivos específicos</h2>
				<h3>Sequência de aulas fáceis</h3>
				<h3>Ampliação da capacidade pulmonar</h3>
				<h3>Conquistando o kakásana</h3>
				<h3>Aumentar a flexidade</h3>
				<h3>Benefícios para a coluna vertebral</h3>
				<h3>Yoga para Gestantes</h3>
				<h3>Conquistando a Invertida sobre a Cabeça</h3>
				<h3>Força para os membros inferiores</h3>
				<h3>Súrya Namaskar, a Saudação ao Sol</h3>
				<h3>Dinamização dos Chakras</h3>
				<h3>Aulas sem ásanas</h3>

				<h2>Filtre as aulas de acordo com as técnicas que você quer executar</h2>
				<h3>Pránáyáma</h3>
				<h3>Ásana</h3>
				<h3>Yoganidrá</h3>
				<h3>Meditação</h3>
				<h3>Kriyá</h3>
				<h3>Japa Mantra</h3>
				<h3>Kirtan Mantra</h3>
				<h3>Mudrá</h3>
				<h3>Pújá</h3>
				<h3>Súrya Namaskar</h3>

			</section>
			<section id='training' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-amber-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Avance em técnicas específicas</h1>
				<h2>Oferecemos diversos treinamentos em técnicas específicas da prática do Yoga.</h2>
				<h2>Ideal para aprofundar e melhorar a execução das técnicas que você tem mais dificuldade ou quer aperfeiçoar</h2>
				<h3>Meditação</h3>
				<h3>Respiratórios</h3>
				<h3>Relaxamento</h3>
				<h3>Técnicas Corporais</h3>
				<h3>Mantras</h3>
				<h3>Mudrás</h3>
				<h3>Kriyás</h3>
			</section>

			<section id='theoretical classes' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-amber-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Vivencia o Yoga de forma intensa</h1>
				<h2>Assista as aulas teóricas para entender como funciona a prática do Yoga. Nada como entender o que você está fazendo para vivenciar as técnicas do Yoga de forma mais intensa e profunda, acelerando seu desenvolvimento no Yoga.</h2>
			</section>
			<section id='courses' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-amber-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Cursos de Aprofundamento</h1>
				<p>Exclusivo para alunos do plano anual</p>
				<h2>Diversos cursos para se aprofundar em temas específicos do Yoga e também outros assuntos que estão relacionados a prática</h2>
				<h3>Alimentação Vegetariana</h3>
				<h3>Anatomia Aplicada ao Yoga</h3>
				<h3>Congresso Semana Sem Carnes</h3>
				<h3>Culinária Vegetariana</h3>
				<h3>Jejum Intermitente</h3>
				<h3>Pránáyáma - A Respiração do Yoga</h3>
				<h3>Saúde e Longevidade</h3>
				<h3>Semana Saúde Através do Yoga</h3>
				<h3>Yoga e Hinduismo</h3>
				<h3>Yoga Sútra de Patáñjali</h3>
			</section>

			<section id='faq' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-56'>
				<h1 className='text-amber-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Perguntas Frequentes</h1>
			</section>
		</main>
	);
}
