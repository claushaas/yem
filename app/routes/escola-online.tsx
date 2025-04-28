import {
	BookmarkIcon,
	CheckCircleIcon,
	HeartIcon,
	PlayIcon,
	UserGroupIcon,
	VideoCameraIcon,
} from '@heroicons/react/24/outline';
import * as Accordion from '@radix-ui/react-accordion';
import { Image } from '@unpic/react';
import { useState } from 'react';
import { Link, type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { AccordionItem } from '~/components/accordion.js';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { PlaylistCard } from '~/components/playlist-card.js';
import SchoolPlansDialog from '~/components/school-plans-dialog';
import { Testimonies } from '~/layouts/testimonies.js';
import { buildImgSource } from '~/utils/build-cloudflare-image-source.js';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: 'Escola Online - Yoga em Movimento' },
	{
		content:
			'A maior escola de Yoga online do Brasil. Com mais de 1500 aulas disponíveis para você praticar onde e quando quiser.',
		name: 'description',
	},
	...data!.meta,
];

export const loader = ({ request }: LoaderFunctionArgs) => ({
	meta: [
		{
			href: new URL('/escola-online', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	],
});

export default function EscolaOnline() {
	const [isSchoolPlansDialogOpen, setIsSchoolPlansDialogOpen] =
		useState<boolean>(false);
	return (
		<>
			<header className="max-xs:max-w-[95%] max-w-[90%] mx-auto my-4 flex justify-between items-center w-[-webkit-fill-available]">
				<div className="w-72">
					<div
						aria-label="Página inicial do Yoga em Movimento"
						className='inline before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")] sm:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")] max-xs:before:h-14 before:h-20 before:block before:bg-no-repeat'
					/>
				</div>
				<div className="flex gap-4 flex-wrap justify-end">
					<Link
						aria-label="Entrar na plataforma do Yoga em Movimento"
						to="/login"
					>
						<Button
							preset={ButtonPreset.Secondary}
							text="Entrar"
							type={ButtonType.Button}
						/>
					</Link>
					<Button
						onClick={() => {
							setIsSchoolPlansDialogOpen(true);
						}}
						preset={ButtonPreset.Primary}
						text="Começar Agora"
						type={ButtonType.Button}
					/>
				</div>
			</header>
			<main>
				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-32"
					id="welcome"
				>
					<div className="w-full mb-4">
						<h1 className="xs:text-5xl lg:text-7xl">
							<span className="text-tomato-11">
								A Maior Escola de Yoga do Brasil.
							</span>{' '}
							<span className="text-pink-11">Na Hora Que Você Quiser.</span>{' '}
							<span className="text-purple-11">Onde Você Estiver.</span>
						</h1>
					</div>
					<div className="mb-16">
						<h3 className="text-purple-12 dark:text-purple-4">
							Viva os benefícios do Yoga para o seu Corpo, Mente e Emoções.
							<br />
							Transforme-se na Sua Melhor Versão.
						</h3>
					</div>
					<div className="w-fit mx-auto">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Praticar 7 Dias Grátis"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>

				<Testimonies />

				<section
					className="my-20 sm:my-40 max-w-[95%] sm:max-w-[90%] mx-auto flex flex-col items-center justify-center gap-12"
					id="history"
				>
					<div className="max-w-(--breakpoint-lg) w-full">
						<h1 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5">
							Yoga é para Todas Pessoas!
						</h1>
						<h2 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-8 mb-4">
							É nisso que acreditamos. É por isso que existimos.
						</h2>
						<p className="my-3 font-gothamMedium">
							O Yoga em Movimento surgiu em 2010 no interior de São Paulo, do
							sonho de seus fundadores de espargir esse estilo de vida baseado
							na saúde e no autoconhecimento para cada vez mais pessoas.
						</p>
						<p className="my-3 font-gothamMedium">
							Para tornar o Yoga acessível para todas pessoas, de qualquer
							lugar, migramos em 2015 para o formato EAD, para podermos levar
							essa filosofia de vida a todos os cantos deste planeta.
						</p>
						<p className="my-3 font-gothamMedium">
							Desde então, nossa equipe de professores já formou mais de 1.000
							professores. E junto com a Nossa Escola, já são mais de 14.000
							alunos espalhados pelo mundo.
						</p>
					</div>

					<div className="w-fit mx-auto">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Yoga É para Mim!"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-56 flex flex-col items-center gap-12"
					id="platform"
				>
					<h1 className="text-center text-amber-11 text-3xl xs:text-5xl">
						A Plataforma da Yoga em Movimento evoluiu e foi repensada
						especialmente para a prática do Yoga
					</h1>

					<div className="flex justify-center gap-4 flex-wrap">
						<div className="flex flex-col items-center max-w-80">
							<CheckCircleIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">Acompanhe suas aulas assistidas</h2>
						</div>
						<div className="flex flex-col items-center max-w-80">
							<HeartIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">Guarde suas aulas favoritas</h2>
						</div>
						<div className="flex flex-col items-center max-w-80">
							<BookmarkIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">
								Salve aulas para assistir mais tarde
							</h2>
						</div>
						<div className="flex flex-col items-center max-w-80">
							<VideoCameraIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">Mais de 1650 aulas práticas</h2>
						</div>
						<div className="flex flex-col items-center max-w-80">
							<PlayIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">Mais de 610.000 reproduções</h2>
						</div>
						<div className="flex flex-col items-center max-w-80">
							<UserGroupIcon className="size-20 stroke-amber-10" />
							<h2 className="text-center">Mais de 15.000 alunos</h2>
						</div>
					</div>

					<div className="w-fit mx-auto">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Quero começar Agora!"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-56"
					id="support"
				>
					<h1 className="text-sky-12 dark:text-sky-10 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl">
						Você sempre terá acompanhamento!
					</h1>
					<h2 className="text-sky-11 text-2xl xs:text-4xl md:text-5xl lg:text-6xl">
						Você pode conversar diretamente com nossos professores pelo whatsapp
						ou telegram para tirar suas dúvidas
					</h2>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-56 flex flex-col items-center gap-12"
					id="duration"
				>
					<div>
						<h1 className="text-grass-12 dark:text-grass-11 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl">
							Fica fácil inserir o Yoga na sua rotina diária
						</h1>
						<h2 className="text-grass-9 text-2xl xs:text-4xl md:text-5xl lg:text-6xl">
							Pratique em qualquer horário e escolha aula de acordo com o tempo
							disponível
						</h2>
						<h2 className="text-grass-11 text-2xl xs:text-4xl md:text-5xl lg:text-6xl">
							Aulas de 15 até 90 minutos
						</h2>
					</div>

					<div className="w-fit mx-auto">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Praticar 7 dias Grátis!"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto mt-20 sm:mt-56 mb-10"
					id="objectives"
				>
					<h1 className="text-orange-9 text-3xl xs:text-5xl md:text-6xl lg:text-7xl">
						Alcance seus objetivos no Yoga
					</h1>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto mb-32"
					id="filters"
				>
					<h2 className="text-orange-11 text-2xl xs:text-4xl">
						Filtre as aulas de acordo com sua meta
					</h2>

					<div className="flex flex-wrap gap-3">
						<div className="grid grid-rows-[3fr_1fr_1fr_2fr_2fr_3fr] grid-cols-[3fr_1fr_2fr] gap-3 grow basis-80 h-[500px]">
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 col-span-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Força"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('dd4a873b-972a-48b7-4c4f-666353046c00')}
									width={660}
								/>
								<h3 className="text-white text-[60cqb] @sm:text-[75cqb] @md:text-[100cqb] leading-none break-words w-full">
									Força
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Equilíbrio"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('68646074-356d-4ce7-5eba-de3afd57af00')}
									width={660}
								/>
								<h3 className="text-white text-[40cqmin] leading-none break-words w-full">
									Equilíbrio
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-2 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Introspecção"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('91094bcd-1439-4b8b-d762-4ff5b6db0900')}
									width={660}
								/>
								<h3 className="text-white text-[40cqmin] leading-none break-words w-full">
									Introspecção
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Restaurativa"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('f77a1f17-1aa4-4966-de10-732db9f2b900')}
									width={660}
								/>
								<h3 className="text-white text-[80cqb] @md:text-[100cqb] leading-none break-words w-full">
									Restaurativa
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Purificação"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('4dc99a7c-d456-45d9-d787-ef744aea6c00')}
									width={660}
								/>
								<h3 className="text-white text-[50cqb] @[15rem]:text-[60cqb] leading-none break-words w-full">
									Purificação
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Respiração"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('1f6021aa-333c-4f2b-470f-4349252e2600')}
									width={660}
								/>
								<h3 className="text-white text-[30cqb] leading-none break-words w-full">
									Respiração
								</h3>
							</div>
						</div>
						<div className="grid grid-rows-[3fr_1fr_1fr_2fr_2fr_3fr] grid-cols-[2fr_3fr_1fr_2fr] gap-3 grow basis-80 h-[500px]">
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Meditação"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('71e20f1e-2f19-48dc-d1c3-bab403dc4300')}
									width={660}
								/>
								<h3 className="text-white text-[50cqb] @[15rem]:text-[60cqb] leading-none break-words w-full">
									Meditação
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Relaxamento"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('289f609f-5233-41f7-445c-838d4c5c0600')}
									width={660}
								/>
								<h3 className="text-white text-[35cqb] @[10rem]:text-[50cqb] leading-none break-words w-full">
									Relaxamento
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-4 col-span-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Flexibilidade"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('a78cfa8f-da25-4b3c-5bfa-1204f404c800')}
									width={660}
								/>
								<h3 className="text-white text-[30cqmin] @md:text-[50cqmin] leading-none break-words w-full">
									Flexibilidade
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Vinyasa"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('d95f2201-7e07-4a0b-02b2-b23f8c6ee300')}
									width={660}
								/>
								<h3 className="text-white text-[45cqmin] leading-none break-words w-full">
									Vinyasa
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Sem Ásanas"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('dfcb9015-a642-4699-095b-53fabdf84e00')}
									width={660}
								/>
								<h3 className="text-white text-[45cqmin] leading-none break-words w-full">
									Sem Ásanas
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Yoga na Cadeira"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={180}
									layout="constrained"
									src={buildImgSource('d9d57548-85b0-4362-e6b7-6dc6adbc8e00')}
									width={180}
								/>
								<h3 className="text-white text-[30cqmin] leading-none break-words w-full">
									Yoga na Cadeira
								</h3>
							</div>
						</div>
					</div>
				</section>

				<section className="mb-32" id="playlists">
					<h2 className="pl-4 text-orange-11 max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto">
						Playlist de aulas prontas e voltadas para objetivos específicos
					</h2>

					<div className="mx-auto max-w-max">
						<div className="flex gap-4 overflow-x-scroll p-4">
							<PlaylistCard
								image="84974a1a-42e3-4baf-c6a2-dca51ddf8c00"
								title="Sequência de aulas fáceis"
							/>
							<PlaylistCard
								image="8163eb7b-89b6-4c34-626e-951a4a5b2100"
								title="Ampliação da capacidade pulmonar"
							/>
							<PlaylistCard
								image="74ca08ab-cb39-4070-c31f-c7e15b2f0100"
								title="Conquistar o kakásana"
							/>
							<PlaylistCard
								image="50d4c33f-7b24-4666-5db7-1978a46ea600"
								title="Aumentar a flexidade"
							/>
							<PlaylistCard
								image="9bb9a29b-ab84-4b93-6d6f-c86c6a610200"
								title="Benefícios para a coluna vertebral"
							/>
							<PlaylistCard
								image="16373cdf-04bf-4c49-7737-9ad641abbb00"
								title="Yoga para Gestantes"
							/>
							<PlaylistCard
								image="b3c32bba-94e8-472d-5e4d-df42be060900"
								title="Conquistar a Invertida sobre a Cabeça"
							/>
							<PlaylistCard
								image="2c5b2e14-7acd-4ceb-6961-3c46ccb16800"
								title="Força para os membros inferiores"
							/>
							<PlaylistCard
								image="b0fdcff6-7302-4a79-2b8a-0ff537cd7800"
								title="Súrya Namaskar, a Saudação ao Sol"
							/>
							<PlaylistCard
								image="b58903d4-699c-4df4-0103-299f4ed70c00"
								title="Dinamização dos Chakras"
							/>
							<PlaylistCard
								image="d9d57548-85b0-4362-e6b7-6dc6adbc8e00"
								title="Aulas sem ásanas"
							/>
						</div>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto mb-20"
					id="tecnics"
				>
					<h2 className="text-orange-11">
						Filtre as aulas de acordo com as técnicas que você quer executar
					</h2>

					<div className="grid grid-rows-[1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-3 grow basis-80 h-[350px]">
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-3 relative">
							<Image
								alt="Pránáyáma"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('1f6021aa-333c-4f2b-470f-4349252e2600')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Pránáyáma
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-3 relative">
							<Image
								alt="Ásana"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('862763a1-6025-444f-51e5-efe126137600')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Ásana
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Yoganidrá"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('5aca9649-da6c-496c-7478-1dc1476a2f00')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Yoganidrá
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Meditação"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('3c5abf6b-d446-4075-d589-b310357d2600')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Meditação
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Kriyá"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('aaa856b4-aa6e-4e62-3124-852e36192200')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Kriyá
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-3 relative">
							<Image
								alt="Japa Mantra"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('f88fe433-0f60-499a-51a6-1ed0bf2c4000')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Japa Mantra
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-3 relative">
							<Image
								alt="Kirtan Mantra"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('8e99bdf5-5efb-49bf-8259-4617dc754600')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Kirtan Mantra
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Mudrá"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('bf16acad-239a-4d9d-b99b-ab6e18865900')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Mudrá
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Pújá"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('b011e480-1a94-4815-e535-4388ea7ea900')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Pújá
							</h3>
						</div>
						<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center col-span-2 relative">
							<Image
								alt="Súrya Namaskar"
								cdn="cloudflare_images"
								className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
								height={310}
								layout="constrained"
								src={buildImgSource('2f0bda40-8d0e-448c-a5d8-f73d73728c00')}
								width={660}
							/>
							<h3 className="text-white text-[30cqb] leading-none break-words w-full text-center">
								Súrya Namaskar
							</h3>
						</div>
					</div>

					<div className="w-fit mx-auto mt-20">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Quero começar Agora!"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="my-20 sm:my-56 flex flex-col-reverse sm:flex-row"
					id="training"
				>
					<div className="sm:basis-7/12 p-5 flex flex-col justify-center">
						<h1 className="pl-10 text-indigo-12 dark:text-indigodark-11 text-3xl md:text-5xl lg:text-7xl">
							Avance em técnicas específicas
						</h1>
						<h2 className="pl-10 text-indigo-9 text-lg xl:text-2xl">
							Oferecemos diversos treinamentos em técnicas específicas da
							prática do Yoga.
							<br />
							Ideal para aprofundar e melhorar a execução das técnicas que você
							tem mais dificuldade ou quer aperfeiçoar:
						</h2>
						<ul className="pl-10">
							<li>
								<h3 className="text-sm xl:text-lg">Meditação</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Respiratórios</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Relaxamento</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Técnicas Corporais</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Mantras</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Mudrás</h3>
							</li>
							<li>
								<h3 className="text-sm xl:text-lg">Kriyás</h3>
							</li>
						</ul>
						<div className="w-fit mx-auto mt-20">
							<Button
								onClick={() => {
									setIsSchoolPlansDialogOpen(true);
								}}
								preset={ButtonPreset.Primary}
								text="Começar a Praticar"
								type={ButtonType.Button}
							/>
							<p className="text-center text-sm mt-1.5">
								cancele quando quiser
							</p>
						</div>
					</div>
					<div className="sm:basis-5/12">
						<Image
							alt="Sequência de aulas fáceis"
							cdn="cloudflare_images"
							className="sm:rounded-s-xl shadow-xs shadow-mauve-11 max-h-96 sm:max-h-[800px]"
							layout="fullWidth"
							src={buildImgSource('4e9069b2-0a43-45f8-4e62-09d6899c9600')}
						/>
					</div>
				</section>

				<section
					className="my-20 sm:my-56 flex flex-col sm:flex-row"
					id="theoretical classes"
				>
					<div className="sm:basis-5/12">
						<Image
							alt="Sequência de aulas fáceis"
							cdn="cloudflare_images"
							className="sm:rounded-e-xl shadow-xs shadow-mauve-11 max-h-96 sm:max-h-[800px]"
							layout="fullWidth"
							src={buildImgSource('c74dc1e1-0609-45b4-025f-9dc083ead200')}
						/>
					</div>
					<div className="sm:basis-7/12 p-5 flex flex-col justify-center">
						<h1 className="text-indigo-12 dark:text-indigodark-11 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl">
							Vivencie o Yoga intensamente
						</h1>
						<h2 className="text-indigo-9 text-xl sm:text-2xl xl:text-5xl">
							Assista as aulas teóricas para entender como funciona a prática do
							Yoga. Nada como entender o que você está fazendo para vivenciar as
							técnicas do Yoga de forma mais intensa e profunda, acelerando seu
							desenvolvimento no Yoga.
						</h2>
					</div>
				</section>

				<section
					className="my-20 sm:my-56 flex flex-col md:flex-row items-center"
					id="courses"
				>
					<div className="sm:basis-1/2 lg:basis-7/12 p-5">
						<h1 className="text-ruby-11 mb-1 text-4xl xs:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
							Cursos de Aprofundamento
						</h1>
						<p className="text-ruby-12 dark:text-rubydark-11 mb-7">
							Exclusivo para alunos do plano anual
						</p>
						<h2 className="text-ruby-9 md:text-5xl lg:text-6xl">
							Diversos cursos para se aprofundar em temas específicos do Yoga e
							também outros assuntos que estão relacionados a prática
						</h2>

						<div className="w-fit mx-auto mt-20">
							<Button
								onClick={() => {
									setIsSchoolPlansDialogOpen(true);
								}}
								preset={ButtonPreset.Primary}
								text="Aproveitar os Cursos Grátis"
								type={ButtonType.Button}
							/>
							<p className="text-center text-sm mt-1.5">
								cancele quando quiser
							</p>
						</div>
					</div>

					<div className="flex flex-wrap flex-col gap-3 sm:basis-1/2 lg:basis-5/12 w-full">
						<div className="grid grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-3 grow h-[450px]">
							<div className="bg-mauve-10 md:rounded-3xl rounded-e-3xl px-1 py-3 w-full h-full row-span-3 col-span-3 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Alimentação Vegetariana"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-3xl rounded-e-3xl mix-blend-multiply -z-10"
									height={150}
									layout="constrained"
									src={buildImgSource('25223356-ae05-4b82-0467-473b742ed600')}
									width={350}
								/>
								<h3 className="text-white text-[20cqb] leading-none break-words w-full">
									Alimentação Vegetariana
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-s-3xl px-1 py-3 w-full h-full row-span-3 col-span-3 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Anatomia Aplicada ao Yoga"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-s-3xl mix-blend-multiply -z-10"
									height={150}
									layout="constrained"
									src={buildImgSource('ef0eef53-cc56-40b5-05fc-9d263e98d800')}
									width={350}
								/>
								<h3 className="text-white text-[20cqb] leading-none break-words w-full">
									Anatomia Aplicada ao Yoga
								</h3>
							</div>
							<div className="bg-mauve-10 md:rounded-s-3xl px-1 py-3 w-full h-full row-span-2 col-span-6 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Caminhos para o Orgasmo e a Feminilidade"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-s-3xl mix-blend-multiply -z-10"
									height={150}
									layout="constrained"
									src={buildImgSource('421a7c7a-4676-48fe-fa2a-7133b0e38d00')}
									width={750}
								/>
								<h3 className="text-white text-[35cqb] leading-none break-words w-full">
									Caminhos para o Orgasmo e a Feminilidade
								</h3>
							</div>
							<div className="bg-mauve-10 md:rounded-3xl rounded-e-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Congresso Semana Sem Carnes"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-3xl rounded-e-3xl mix-blend-multiply -z-10"
									height={250}
									layout="constrained"
									src={buildImgSource('eee7cc3a-49c9-481a-a5a4-bc7fd47e1700')}
									width={250}
								/>
								<h3 className="text-white text-[11cqb] leading-none break-words w-full">
									Congresso Semana Sem Carnes
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Culinária Vegetariana"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={250}
									layout="constrained"
									src={buildImgSource('5052cea8-8294-4a0f-678c-21b1c10b5700')}
									width={250}
								/>
								<h3 className="text-white text-[9cqb] leading-none break-words w-full">
									Culinária Vegetariana
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-s-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Jejum Intermitente"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-s-3xl mix-blend-multiply -z-10"
									height={250}
									layout="constrained"
									src={buildImgSource('e5f0c092-57e1-4b59-b6cd-8b1f3e3ce200')}
									width={250}
								/>
								<h3 className="text-white text-[9cqb] leading-none break-words w-full">
									Jejum Intermitente
								</h3>
							</div>
						</div>
						<div className="grid grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-3 grow h-[450px]">
							<div className="bg-mauve-10 md:rounded-s-3xl px-1 py-3 w-full h-full row-span-2 col-span-6 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Pránáyáma - A Respiração do Yoga"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-s-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('2f52be6e-481f-4c60-5ddc-71192ddf4800')}
									width={660}
								/>
								<h3 className="text-white text-[40cqb] leading-none break-words w-full">
									Pránáyáma - A Respiração do Yoga
								</h3>
							</div>
							<div className="bg-mauve-10 md:rounded-3xl rounded-e-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Saúde e Longevidade"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-3xl rounded-e-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('4f3379ea-9092-472e-8bc5-93c088191b00')}
									width={660}
								/>
								<h3 className="text-white text-[8cqb] leading-none break-words w-full">
									Saúde e Longevidade
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Sámkhya"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('139567ab-6bd1-4b43-dacf-51fa8623ec00')}
									width={660}
								/>
								<h3 className="text-white text-[12cqb] leading-none break-words w-full">
									Sámkhya
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-s-3xl px-1 py-3 w-full h-full row-span-4 col-span-2 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Yoga Sútra de Patáñjali"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-s-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('ff1ab7b4-3266-4328-1577-6b02510d8a00')}
									width={660}
								/>
								<h3 className="text-white text-[13cqb] leading-none break-words w-full">
									Yoga Sútra de Patáñjali
								</h3>
							</div>
							<div className="bg-mauve-10 md:rounded-3xl rounded-e-3xl px-1 py-3 w-full h-full row-span-3 col-span-3 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Yoga e Hinduismo"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full md:rounded-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('07fbb938-af71-4033-c324-5fb028d37200')}
									width={660}
								/>
								<h3 className="text-white text-[23cqb] leading-none break-words w-full">
									Yoga e Hinduismo
								</h3>
							</div>
							<div className="bg-mauve-10 rounded-s-3xl px-1 py-3 w-full h-full row-span-3 col-span-3 -z-20 shadow-xs shadow-mauve-11 @container-[size] flex items-center relative">
								<Image
									alt="Semana Saúde Através do Yoga"
									cdn="cloudflare_images"
									className="absolute top-0 left-0 w-full h-full rounded-s-3xl mix-blend-multiply -z-10"
									height={310}
									layout="constrained"
									src={buildImgSource('d8ec5f16-d3b6-4a96-5494-fe70baf8fa00')}
									width={660}
								/>
								<h3 className="text-white text-[25cqb] leading-none break-words w-full">
									Semana Saúde Através do Yoga
								</h3>
							</div>
						</div>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-56"
					id="faq"
				>
					<h1 className="text-purple-11 mb-24 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-center">
						Perguntas Frequentes
					</h1>
					<Accordion.Root
						className="rounded-xl"
						collapsible
						defaultValue="1"
						type="single"
					>
						<AccordionItem value="1">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Posso parcelar a anuidade?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Sim, é possível parcelar em até 12 vezes sem juros no cartão
									de crédito. Caso não tenha cartão ou precise de outra forma de
									pagamento entre em contato com nosso suporte no{' '}
									<a
										href="https://wa.me/551149359150"
										rel="noreferrer"
										target="_blank"
									>
										WhatsApp (11) 4935-9150
									</a>
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="2">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Como é feito o acesso?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Caso ainda não possua cadastro em nossa plataforma,
									imediatamente após a confirmação do pagamento você receberá um
									email com a senha de acesso, exclusiva para você.
								</p>
								<p>
									E além disso você receberá outros emails com as dicas de como
									começar a usufruir da sua escola de yoga.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="3">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Qual a diferença entre o plano anual e o plano mensal?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Além do valor bem mais em conta do plano anual, os cursos de
									aprofundamento só estarão disponíveis para alunos do plano
									anual.
								</p>
								<p>
									O plano mensal custo R$ 77,00 por mês. O plano anual esta
									saindo por apenas 497 reais por ano, equivalente a apenas 41
									reais por mês.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="4">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Como funciona o cancelamento?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Você pode cancelar as renovações futuras da sua anuidade ou
									mensalidades quando quiser, e oferecemos um prazo de 7 dias
									após o pagamento para estornos.
								</p>
							</Accordion.Content>
						</AccordionItem>
					</Accordion.Root>

					<div className="w-fit mx-auto mt-28">
						<Button
							onClick={() => {
								setIsSchoolPlansDialogOpen(true);
							}}
							preset={ButtonPreset.Primary}
							text="Quero começar Agora!"
							type={ButtonType.Button}
						/>
						<p className="text-center text-sm mt-1.5">cancele quando quiser</p>
					</div>
				</section>
			</main>

			<SchoolPlansDialog
				isOpen={isSchoolPlansDialogOpen}
				onOpenChange={setIsSchoolPlansDialogOpen}
			/>
		</>
	);
}
