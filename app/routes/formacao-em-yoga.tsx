import { Stream } from '@cloudflare/stream-react';
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
import {
	Link,
	type LoaderFunctionArgs,
	type MetaFunction,
	useLocation,
} from 'react-router';
import { AccordionItem } from '~/components/accordion';
import { Button, ButtonPreset, ButtonType } from '~/components/button.js';
import { FormationBonusCard } from '~/components/formation-bonus-card';
import { FormationContentCard } from '~/components/formation-content-card';
import { Testimonies } from '~/layouts/testimonies';
import { buildImgSource } from '~/utils/build-cloudflare-image-source';

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: 'Formação em Yoga - Yoga em Movimento' },
	{
		content:
			'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.',
		name: 'description',
	},
	...data!.meta,
];

export const loader = ({ request }: LoaderFunctionArgs) => ({
	meta: [
		{
			href: new URL('/formacao-em-yoga', request.url).toString(),
			rel: 'canonical',
			tagName: 'link',
		},
	],
});

export default function Formacao() {
	const { search } = useLocation();
	const searchParameters = search ? search.split('?')[1].split('&') : [];
	const marketingSearchParameters = searchParameters.filter((searchParameter) =>
		searchParameter.includes('utm_'),
	);

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
					<Link
						aria-label="Fazer matrícula no curso de Formação em Yoga"
						to="#investment"
					>
						<Button
							preset={ButtonPreset.Primary}
							text="Começar Agora"
							type={ButtonType.Button}
						/>
					</Link>
				</div>
			</header>
			<main>
				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto mt-5 flex flex-col items-center"
					id="welcome"
				>
					<h1 className="text-purple-12 dark:text-purpledark-12 text-xl sm:text-3xl md:text-4xl xl:text-5xl text-center mb-5">
						Tudo o que você precisa para se tornar uma Instrutora de Yoga, do
						Zero aos Primeiros Alunos
					</h1>
					<div className="max-w-(--breakpoint-lg) w-full">
						<Stream
							autoplay
							className="pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0"
							controls
							preload="auto"
							responsive={false}
							src="6a99796454a960470c8fd444af82b9fe"
						/>
					</div>
					<div className="mt-10">
						<Link
							aria-label="Fazer matrícula no curso de Formação em Yoga"
							to="#investment"
						>
							<Button
								className="text-2xl mb-3"
								preset={ButtonPreset.Primary}
								text="Começar Agora"
								type={ButtonType.Button}
							/>
						</Link>
						<p className="text-center text-xs">cancele quando quiser</p>
					</div>
				</section>

				<Testimonies />

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="school"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Conheça a sua Escola
					</h2>
					<p className="my-3 font-gothamMedium">
						A Yoga em Movimento surgiu em 2010 no interior de São Paulo do sonho
						de seus fundadores de espargir esse estilo de vida baseado na saúde
						e no autoconhecimento para cada vez mais pessoas através do yoga.
					</p>
					<p className="my-3 font-gothamMedium">
						Em 2015 Nossa Escola migrou 100% para o formato online, pois
						percebemos que essa é a melhor forma de chegar a mais pessoas e de
						forma acessível!
					</p>
					<p className="my-3 font-gothamMedium">
						Desde então, nossa equipe de professores, que conta com décadas de
						experiência na formação de instrutores de yoga, já formou mais de
						MIL professores. Somando nossa Escola Online, já passaram mais de 14
						mil alunos pela nossa escola.
					</p>
					<p className="my-3 font-gothamMedium">
						Hoje entendemos que a melhor forma de dar continuidade a nossa
						missão é formar mais professores de sucesso, pois assim
						multiplicamos a nossa capacidade de divulgar e transmitir essa
						filosofia de vida tão bela.
					</p>
					<p className="my-3 font-gothamMedium">
						Nós conhecemos todos os desafios que envolvem essa carreira e por
						isso apresentamos este curso de Formação em Yoga, e dividimos a
						estrutura do curso em 3 pilares essenciais para qualquer professor,
						que já se dedica a esta carreira ou que ainda vai começar: a
						Filosofia, o Magistério e a Profissão.
					</p>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="summary"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5">
						Formação em Yoga!!
					</h2>
					<h3 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-8 mb-4">
						Não em uma Modalidade de Yoga
					</h3>
					<p className="my-3 font-gothamMedium">
						Antes de se especializar em alguma modalidade de yoga, é fundamental
						conhecer os fundamentos gerais do Yoga, sua origem, todas as
						técnicas e as diversas modalidades (antigas e modernas) que existem.
					</p>
					<p className="my-3 font-gothamMedium">
						Nossa Formação em Yoga conta com os 3 piolares fundamentais para ter
						sucesso nessa carreira:
					</p>

					<div className="flex justify-evenly flex-wrap gap-4 my-10">
						<div className="max-w-80 px-7 py-5 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly">
							<h3 className="text-center text-purple-11">1 - Filosofia</h3>
							<p className="font-gothamMedium">
								Como surgiu o Yoga e suas modalidades, os textos sagrados, os
								conceitos fundamentais, as técnicas de meditação, os chakras, a
								prática de pranayamas, e muito mais.
							</p>
						</div>

						<div className="max-w-80 px-7 py-5 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly">
							<h3 className="text-center text-purple-11">2 - Magistério</h3>
							<p className="font-gothamMedium">
								Seja a ponte entre o Yoga e seu aluno: como montar uma aula,
								como corrigir os alunos, como lidar com as dificuldades, como
								lidar com os alunos, como lidar com as emoções, ou seja, como
								ministrar aulas.
							</p>
						</div>

						<div className="max-w-80 px-7 py-5 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly">
							<h3 className="text-center text-purple-11">3 - Profissão</h3>
							<p className="font-gothamMedium">
								Trabalhar com Yoga: como se tornar um profissional de sucesso,
								montar um estúdio, divulgar seu trabalho; como se tornar um
								professor de Yoga online... Como planejar, divulgar e matricular
								os seus alunos.
							</p>
						</div>
					</div>

					<div className="mt-10 w-fit mx-auto flex flex-col items-center">
						<Link
							aria-label="Fazer matrícula no curso de Formação em Yoga"
							to="#investment"
						>
							<Button
								className="text-2xl mb-3"
								preset={ButtonPreset.Primary}
								text="Começar Agora"
								type={ButtonType.Button}
							/>
						</Link>
						<p className="text-center text-xs">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="target"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Para quem é?
					</h2>

					<p className="my-3 font-gothamMedium">
						<span className="font-gothamBold text-purple-8">
							Para quem quer ser Professor de Yoga
						</span>{' '}
						e entende a importância de não só aprender sobre a filosofia e o
						magistério do Yoga, mas também quer ter sucesso nesta carreira
					</p>
					<p className="my-3 font-gothamMedium">
						<span className="font-gothamBold text-purple-8">
							Para quem já é Professor de alguma Modalidade de Yoga
						</span>{' '}
						e sente que a sua formação não foi completa. A maioria dos cursos de
						formação abordam apenas uma modalidade e muitas vezes não contemplam
						nem mesmo todas as técnicas do Yoga. Neste curso você poderá
						aprender o panorama geral e completo
					</p>
					<p className="my-3 font-gothamMedium">
						<span className="font-gothamBold text-purple-8">
							Para quem não quer ser Professor de Yoga
						</span>{' '}
						e percebeu que chegou num estágio da prática em que sente
						necessidade de se aprofundar na filosofia do Yoga para consolidar o
						aprendizado que obteve através da prática
					</p>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="prerequisites"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Quais são os Pré-Requisitos para Participar?
					</h2>

					<p className="my-3 font-gothamMedium">
						Apenas a vontade de aprender e compartilhar esta incrível Filosofia
						de Vida Prática.
					</p>
					<p className="my-3 font-gothamMedium">
						Você não precisa ter experiência prévia no Yoga para iniciar a Nossa
						Formação.
					</p>
					<p className="my-3 font-gothamMedium">
						Embora a experiência prática seja muito importante para o professor,
						você terá acesso a mais de 1500 aulas práticas da nossa escola (mais
						informações abaixo nos bônus) para começar a sua trilha no Yoga e
						acumular bastante experiência prática ao longo do curso!
					</p>

					<div className="mt-10 w-fit mx-auto flex flex-col items-center">
						<Link
							aria-label="Fazer matrícula no curso de Formação em Yoga"
							to="#investment"
						>
							<Button
								className="text-2xl mb-3"
								preset={ButtonPreset.Primary}
								text="Quero Me Matricular"
								type={ButtonType.Button}
							/>
						</Link>
						<p className="text-center text-xs">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="bonus"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Bônus Gratuitos
					</h2>

					<p className="font-gothamMedium">
						Diversos conteúdos e conhecimentos são enriquecedores para o
						Professor de Yoga, embora não sejam fundamentais na sua formação.
						Para formar profissionais completos e que possam entrar no mercado
						de trabalho com segurança, oferecemos diversos bônus inteiramente
						gratuitos em nosso curso. Estes conteúdos são acessíveis apenas
						através deste curso e não estão disponíveis de nenhuma outra forma
					</p>

					<div className="flex flex-wrap gap-8 justify-center my-10">
						<FormationBonusCard
							description="Acesse mais de 1500 aulas práticas de Yoga para manter sua prática em dia e se inspirar para suas aulas."
							image="1a71c32c-8ef4-46e4-5e89-445d50c2ae00"
							teacher="Diversos Professores"
							title="Escola Online"
						/>

						<FormationBonusCard
							description="Daniel tráz excelentes reflexões sobre a valorização da profissão e ainda como se posicionar melhor no mercado de trabalho."
							image="e49ddc48-921f-4c28-84d5-b43b39919e00"
							teacher="Prof. Daniel Borges"
							title="Yoga Personalizado"
						/>

						<FormationBonusCard
							description="Desvende o seu propósito de vida sob uma ótica empreendedora com este curso."
							image="1e1539d9-3d84-4706-653b-d14890926600"
							teacher="Prof. Ricardo Mallet"
							title="Realize-se e Realize Mais"
						/>

						<FormationBonusCard
							description="Neste curso descubra como ministrar Aulas de Yoga adaptadas para todas as etapas da gestação, desde a concecpção até o nascimento."
							image="8a3cf1ee-a013-4851-506b-bd2c13247c00"
							teacher="Profa. Susana Lopes"
							title="Yoga para Gestantes"
						/>

						<FormationBonusCard
							description="Como adaptar a Metodologia do Yoga para as Crianças. Praticar Yoga ajuda a desenvolver o potencial físico e intelectual dos pimpolhos desde cedo."
							image="2d004e91-1986-4165-4394-c53553a69b00"
							teacher="Profa. Sandra Santana"
							title="Yoga para Crianças"
						/>

						<FormationBonusCard
							description="Ensinar ásanas exige também conhecimentos de anatomia e fisiologia. Descubra como ensinar as técnicas corporais com segurança e competência."
							image="c506441d-57b3-493a-5fad-5c7288e03700"
							teacher="Prof. Ricardo Souza"
							title="Anatomia dos Ásanas"
						/>

						<FormationBonusCard
							description="O conhecimento de anatomia, principalmente da coluna vertebral, é fundamental para o Prof. de Yoga ensinar seus alunos con confiança e segurança."
							image="917e0302-bebe-47d5-cc0f-35fb6a0a9000"
							teacher="Prof. Fernanda Rangel"
							title="Anatomia Aplicada ao Yoga"
						/>

						<FormationBonusCard
							description="Entenda o fundamental para poder orientar seus alunos de forma correta sobre o sistema alimentar mais recomendado para a prática do Yoga."
							image="a590f3bd-be86-418b-8c7f-444598056100"
							teacher="Nutri Shila Minari"
							title="Nutrição Vegetariana"
						/>

						<FormationBonusCard
							description="Considerada uma das técnicas mais modernas e eficazes de se praticar a meditação. Entenda os princípios dessa técnica e como aplicar em suas aulas."
							image="891e5f4a-4ddd-45b1-62d3-7cd75303df00"
							teacher="Profa. Liana Linhares"
							title="Meditação Guiada"
						/>

						<FormationBonusCard
							description="Como ajudar seus alunos a terem mais saúde, e viverem com mais plenitude em todos os âmbitos de suas vidas."
							image="08518c99-983d-4b38-4d6b-da2c7056df00"
							teacher="Dr. Alexandre Garcia"
							title="Saúde e Longevidade"
						/>

						<FormationBonusCard
							description="Um dos 6 principais pontos de vista do Hinduísmo. Uma forma se compreender a vida através de uma ótica espiritualista."
							image="09be8860-9e64-45b0-d120-39e531ea9400"
							teacher="Prof. Luciano Giorgio"
							title="Introdução ao Vedanta"
						/>

						<FormationBonusCard
							description="A língua oficial do yoga, utilizada para nominar técnicas e conceitos do Yoga. Estudar e compreender esta língua faz parte do estudo do Professor de Yoga."
							image="b0528ba6-fb40-4aa2-1ea1-e47b9bf2bf00"
							teacher="Prof. Carlos Cardoso"
							title="Introdução ao Sânscrito"
						/>

						<FormationBonusCard
							description="Shiva, criador do Yoga é o Rei do Bailarinos. Descubra como aprimorar sua movimentação e explorar a consciência ao encadear os ásanas."
							image="a199dc6e-3375-4c4e-91fd-7a45be223200"
							teacher="Profa. Cherrine Cardoso"
							title="Movimentação Sutil"
						/>

						<FormationBonusCard
							description="Técnicas de limpeza do corpo, da mente e das emoções. Como experimentar períodos de purificação destes elementos e ensinar seus alunos."
							image="2805891e-72d9-4d17-b275-bde925b34100"
							teacher="Profa. Ro de Castro"
							title="Bhuta Shuddi"
						/>

						<FormationBonusCard
							description="O Prof. André DeRose tráz neste curso aspectos reais sobre o Yoga e a cultura onde ele surgiu."
							image="f2e10ade-95b4-45fa-435c-02bfe5833b00"
							teacher="Prof. André DeRose"
							title="Histórias do Hinduismo"
						/>

						<FormationBonusCard
							description="Assista a gravação do congresso sobre alimentação vegetariana que reuniu mais de 35 mil participantes."
							image="db3d856d-b594-43ef-4c24-1e5c75cd7500"
							teacher="Diversos Professores"
							title="Congresso Semana Sem Carne"
						/>

						<FormationBonusCard
							description="Aprenda a cozinhar pratos deliciosos da culinária vegetariana inspirados em diversas culturas culinárias diferentes."
							image="9945c6c6-dd54-4163-5b41-d5fcf6152d00"
							teacher="Prof. Claus Haas"
							title="Culinária Vegetariana"
						/>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-40 flex flex-col items-center gap-12"
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

					<div className="mt-10 w-fit mx-auto flex flex-col items-center">
						<Link
							aria-label="Fazer matrícula no curso de Formação em Yoga"
							to="#investment"
						>
							<Button
								className="text-2xl mb-3"
								preset={ButtonPreset.Primary}
								text="Fazer Minha Matrícula"
								type={ButtonType.Button}
							/>
						</Link>
						<p className="text-center text-xs">cancele quando quiser</p>
					</div>
				</section>

				<section
					className="max-w-[95%] sm:max-w-[90%] lg:max-w-(--breakpoint-lg) mx-auto my-20 sm:my-40"
					id="support"
				>
					<h1 className="text-sky-12 dark:text-sky-10 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl">
						Você sempre terá acompanhamento!
					</h1>
					<h2 className="text-sky-11 text-2xl xs:text-4xl md:text-5xl lg:text-6xl">
						Você pode conversar diretamente com nossos professores pelo whatsapp
						ou telegram para tirar suas dúvidas
					</h2>
					<p className="font-gothamMedium">
						Além disso, você contará com o feedback dos professores em todas as
						suas tarefas até o momento em que estiver pronta para as avaliações
						finais.
					</p>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="content"
				>
					<h2 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						O Que Você Vai Receber ao se Matricular
					</h2>

					<div className="max-w-(--breakpoint-md) w-full mx-auto px-7 py-5 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly gap-5">
						<FormationContentCard
							description="com tudo o que você precisa entender sobre Yoga"
							title="Módulos de Filosofia"
						/>

						<FormationContentCard
							description="para aprender a ministrar aulas cativantes e eficientes"
							title="Módulos de Magistério"
						/>

						<FormationContentCard
							description="para planejar sua carreira e conquistar o sucesso"
							title="Módulos de Profissão"
						/>

						<FormationContentCard
							description="para te ajudar em cada etapa dos estudos"
							title="Suporte com Equipe de Professores"
						/>

						<FormationContentCard
							description="com mais de 1500 aulas práticas para manter sua prática em dia e inspirar suas aulas."
							title="Acesso à Escola Online"
						/>

						<FormationContentCard
							description="Você não precisa adquirir nenhum material extra para completar sua formação e receber seu certificado"
							title="Todo o Material Didático Incluso"
						/>

						<FormationContentCard
							description="para aprender a ministrar aulas cativantes e eficientes"
							title="Certificado Emitido Gratuitamente"
						/>

						<FormationContentCard
							description="com ilustrações, nomes, variações e explicações das técnicas corporais do Yoga. Novas posições são adicionadas mensalmente"
							title="Ebook de Ásanas"
						/>

						<FormationContentCard
							description="mostrados na página inteiramente gratuitos"
							title="Todos os Cursos Bônus"
						/>

						<FormationContentCard
							description="as melhores indicações de livros para ampliar os estudos"
							title="Bibliografia recomendada"
						/>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto mt-20 mb-10 sm:mt-40"
					id="investment"
				>
					<h1 className="text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Investimento
					</h1>

					<h2 className="text-purple-12 dark:text-purpledark-12 text-center">
						De R$ <span className="line-through">5.980,00</span> por apenas 12x
						de 97,00 por ano
					</h2>

					<div className="max-w-(--breakpoint-md) mx-auto">
						<p className="font-gothamMedium mb-3 text-center">
							O valor da matrícula em nosso curso curso é R$ 5.980,00.
							Entendemos que o momento atual não permite que muitas pessoas
							possam participar de cursos tão completos como o nosso.
						</p>
						<p className="font-gothamMedium mb-3 text-center">
							Por isso resolvemos criar uma alternativa de matrícula no formato
							de assinatura, com duração de 1 ano e valor anual de R$ 1.164,00,
							ou seja, R$ 97,00 por mês.
						</p>
						<p className="font-gothamMedium mb-3 text-center">
							Você pode cancelar a renovação da anuidade quando quiser.
						</p>
					</div>

					<div className="mx-auto w-fit my-10">
						{/* <Link
							target="_blank"
							to={`https://pay.hotmart.com/G96565416C?${marketingSearchParameters.join('&')}`}
						>
							<Button
								className="text-2xl"
								preset={ButtonPreset.Primary}
								text="Fazer Minha Matrícula"
								type={ButtonType.Button}
							/>
						</Link> */}
						<div className="text-xs text-center mt-3">
							{/* <p>Compra segura com 7 dias de garantia</p>
							<p>Hotmart - Cartão - Pix - Paypal</p> */}
							<p>Inscrições Encerradas</p>
						</div>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto mt-10 mb-20 sm:mb-40"
					id="guarantee"
				>
					<div className="flex max-w-(--breakpoint-md) gap-4 items-center mx-auto flex-wrap sm:flex-nowrap justify-center">
						<div className="shrink-0">
							<Image
								alt="Garantia Incondicional de 7 Dias"
								cdn="cloudflare_images"
								className="w-full h-full"
								height={100}
								layout="constrained"
								src={buildImgSource('6dab2385-3610-4d32-35d4-75f1a9bc2c00')}
								width={100}
							/>
						</div>
						<div className="shrink">
							<h2 className="text-purple-11 dark:text-purpledark-11 text-center sm:text-left text-lg">
								Garantia Incondicional de 7 Dias
							</h2>
							<p className="text-purple-12 dark:text-purpledark-12 font-gothamMedium text-xs">
								Você pode entrar, acessar todo o conteúdo e bônus e, se não se
								adaptar, entender que não é para você ou até mesmo se arrepender
								nos primeiros 7 dias, devolvemos 100% do seu dinheiro investido.
								Simples assim, sem complicações ou letras miúdas.
							</p>
						</div>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="curriculum"
				>
					<h2 className="text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Conteúdo do Curso
					</h2>

					<p className="text-center font-gothamMedium">
						Nosso Curso está divido em 3 pilares fundamentais, que são 3 grandes
						módulos, abaixo estão o conteúdo e o motivo de cada um:
					</p>

					<div className="flex gap-5 flex-wrap mt-5 justify-center">
						<div className="w-96 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5">
							<h3 className="text-purple-11 dark:text-purpledark-11 text-center">
								I - Filosofia
							</h3>

							<p className="mb-4 font-gothamMedium">
								Você precisa conhecer a filosofia do Yoga. Isso significa
								conhecer o contexto cronológico e cultural do Yoga. Entender os
								conceitos filosóficos e práticos das técnicas, como funcionam, o
								que proporcionam ao praticante:
							</p>

							<div className="ml-6">
								<ol className="list-decimal">
									<li className="mb-2">
										<p>Introdução</p>
										<ul className="list-disc">
											<li>
												<p>O que é o Yoga</p>
											</li>
											<li>
												<p>Meta e objetivos do Yoga</p>
											</li>
											<li>
												<p>Origens do Yoga</p>
											</li>
											<li>
												<p>Técnicas do Yoga</p>
											</li>
											<li>
												<p>Sistema Clássico de Patáñjáli</p>
											</li>
											<li>
												<p>Modalidades de Yoga</p>
											</li>
											<li>
												<p>Modalidades de Yoga da atualidade</p>
											</li>
										</ul>
									</li>
									<li className="mb-2">
										<p>Chakras e Nadís</p>
										<ul className="list-disc">
											<li>
												<p>O que são os Chakras</p>
											</li>
											<li>
												<p>As 3 principais Nadís</p>
											</li>
											<li>
												<p>Estimulando os Chakras</p>
											</li>
											<li>
												<p>Granthis</p>
											</li>
										</ul>
									</li>
									<li className="mb-2">
										<p>Yoga Sutra de Patáñjáli</p>
										<ul className="list-disc">
											<li>
												<p>Introdução ao Yoga Sutra</p>
											</li>
											<li>
												<p>Resumo das trilhas</p>
											</li>
										</ul>
									</li>
									<li className="mb-2">
										<p>Alimentação no Yoga</p>
									</li>
									<li className="mb-2">
										<p>Técnicas do Yoga</p>
										<ul className="list-disc">
											<li>
												<p>Mudrá</p>
											</li>
											<li>
												<p>Pújá</p>
											</li>
											<li>
												<p>Mantra</p>
											</li>
											<li>
												<p>Kriyá</p>
											</li>
											<li>
												<p>Ásana</p>
											</li>
											<li>
												<p>Pránáyáma</p>
											</li>
											<li>
												<p>Yoganidrá</p>
											</li>
											<li>
												<p>Samyama</p>
											</li>
										</ul>
									</li>
									<li className="mb-2">
										<p>O Código de Ética do Yoga</p>
										<ul className="list-disc">
											<li>
												<p>Yamas</p>
											</li>
											<li>
												<p>Nyamas</p>
											</li>
											<li>
												<p>Ferramentas de evolução</p>
											</li>
										</ul>
									</li>
									<li className="mb-2">
										<p>Hinduísmo</p>
										<ul className="list-disc">
											<li>
												<p>Karma e Dharma</p>
											</li>
											<li>
												<p>Sámkhya e Vedanta</p>
											</li>
											<li>
												<p>Literatura</p>
											</li>
											<li>
												<p>Sânscrito</p>
											</li>
											<li>
												<p>Tantra e Brahmachárya</p>
											</li>
										</ul>
									</li>
								</ol>
							</div>
						</div>

						<div className="w-96 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5">
							<h3 className="text-purple-11 dark:text-purpledark-11 text-center">
								II - Magistério
							</h3>

							<p className="mb-4 font-gothamMedium">
								Se você não souber como transmitir seus conhecimentos aos seus
								alunos, seu futuro como Professora não será muito bom. Apenas
								com uma boa didática e pedagogia é que você conseguirá ser a
								ponte entre o seu aluno e a filosofia do Yoga. Precisa saber
								ensinar o Yoga:
							</p>

							<div className="ml-6">
								<ul className="list-disc">
									<li>
										<p>Objetivos dos Alunos</p>
									</li>
									<li>
										<p>Como introduzir o aluno novo</p>
									</li>
									<li>
										<p>Como acompanhar a evolução dos seus alunos</p>
									</li>
									<li>
										<p>Como montar a sua sala de práticas</p>
									</li>
									<li>
										<p>As diversas variações das técnicas</p>
									</li>
									<li>
										<p>Opções e tipos de aulas de Yoga</p>
									</li>
									<li>
										<p>Aprimorando a execução das técnicas</p>
									</li>
									<li>
										<p>Yoga em círculo</p>
									</li>
									<li>
										<p>Yoga em duplas</p>
									</li>
									<li>
										<p>A melhor forma de demonstrar as técnicas</p>
									</li>
									<li>
										<p>Como ensinar seus alunos a praticarem com segurança</p>
									</li>
									<li>
										<p>Como encadear as técnicas</p>
									</li>
									<li>
										<p>Combinação de técnicas</p>
									</li>
									<li>
										<p>Músicas nas aulas</p>
									</li>
									<li>
										<p>Como aprimorar a sua locução</p>
									</li>
									<li>
										<p>Como corrigir os seus alunos</p>
									</li>
								</ul>
							</div>
						</div>

						<div className="w-96 rounded-3xl shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5">
							<h3 className="text-purple-11 dark:text-purpledark-11 text-center">
								III - Profissão
							</h3>

							<p className="mb-4 font-gothamMedium">
								Não queremos apenas te formar, queremos que você tenha sucesso
								nesta carreira. Vamos te ensinar como iniciar esta carreira,
								como se formalizar, como planejar, divulgar e matricular os seus
								alunos, e por aí vai:
							</p>

							<div className="ml-6">
								<ul className="list-disc">
									<li>
										<p>Como é a regulamentação da profissão</p>
									</li>
									<li>
										<p>Como se formalizar e atuar como professor de yoga</p>
									</li>
									<li>
										<p>Como e que tipo de conteúdos produzir</p>
									</li>
									<li>
										<p>Entender a jornada dos seus alunos</p>
									</li>
									<li>
										<p>Como divulgar o seu trabalho</p>
									</li>
									<li>
										<p>Como precificar o seu trabalho</p>
									</li>
									<li>
										<p>Como planejar as receitas e as despesas</p>
									</li>
									<li>
										<p>Como usar as redes sociais para divulgação</p>
									</li>
									<li>
										<p>Como fazer o atendimento de um interessado</p>
									</li>
									<li>
										<p>Como fazer a matrícula de um aluno novo</p>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section
					className="2xl:max-w-(--breakpoint-xl) max-w-[90%] mx-auto my-20 sm:my-40"
					id="faq"
				>
					<h2 className="text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Perguntas Frequentes
					</h2>

					<Accordion.Root
						className="rounded-xl"
						collapsible
						defaultValue="1"
						type="single"
					>
						<AccordionItem value="1">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>
										O curso é baseado em alguma modalidade específica de Yoga?
									</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									É um curso de Formação em Yoga, não de uma modalidade
									específica. Estudaremos os elementos que constituem todas as
									principais modalidades da atualidade. (Hatha Yogam Ashtánga
									Yoga, Yoga integral, Swásthya Yoga…). No final do curso você
									poderá ministrar aulas de uma modalidade com a qual se
									identifique mais ou, assim como nós, ministrar aulas
									simplesmente de Yoga. Sem nomes ou rótulos.
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
									imediatamente após a confirmação da matrícula você receberá um
									email com a senha de acesso, exclusiva para você.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="3">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Como são as provas de avaliação?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									A avaliação final é feita em duas etapas. A primeira é uma
									prova teórica, baseada no conteúdo estudado ao longo do curso,
									feita diretamente na área de alunos da formação no nosso site.
									A segunda é uma aula prática ministrada pelo aluno, com
									duração entre 30 e 45 minutos. Essa aula deverá ser gravada em
									vídeo (pode ser pelo celular, notebook ou qualquer outra
									câmera) e enviada para os professores avaliarem e
									posteriormente enviarem o feedback.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="4">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>
										O curso oferece um certificado? Posso dar aulas em outros
										países?
									</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Ao término do curso, os alunos aprovados na avaliação final
									receberão o certificado internacional de instrutor de Yoga e
									poderão ministrar aulas em todo o território nacional e até
									mesmo no exterior.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="5">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>
										Terei que comprar algum livro ou outro material didático?
									</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Não, você não precisará investir nada além do valor do curso.
									Oferecemos a nossos alunos um material de apoio já incluído no
									valor do curso. São vários e-books que facilitarão os estudos
									e se tornarão excelentes fontes de consulta ao longo de toda a
									carreira de Instrutor de Yoga. Também temos uma bibliografia
									recomendada com muitos títulos de autores sérios e renomados
									do mundo do Yoga.
								</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value="6">
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Posso cancelar a assinatura quando quiser?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>
									Sim! Esse formato de assinatura da nossa formação permite que
									você faça o cancelamento da renovação da anuidade quando você
									quiser. Ao cancelar, são interrompidas as próximas renovações
									da anuidade e o seu acesso continua funcionando normalmente
									até o final da anuidade atual.
								</p>
							</Accordion.Content>
						</AccordionItem>
					</Accordion.Root>
				</section>

				{/* <section>
					<h1 className="text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
						Ficou alguma dúvida?
					</h1>
					<h2 className="text-purple-12 dark:text-purpledark-12 text-xl xs:text-3xl md:text-4xl mb-5 text-center">
						Entre em contato no{' '}
						<a
							href="https://wa.me/551149359150"
							rel="noreferrer"
							target="_blank"
						>
							WhatsApp (11) 4935-9150
						</a>
					</h2>

					<div className="mt-10 w-fit mx-auto flex flex-col items-center">
						<Link
							aria-label="Fazer matrícula no curso de Formação em Yoga"
							to="#investment"
						>
							<Button
								className="text-2xl mb-3"
								preset={ButtonPreset.Primary}
								text="Iniciar Agora"
								type={ButtonType.Button}
							/>
						</Link>
						<p className="text-center text-xs">cancele quando quiser</p>
					</div>
				</section> */}
			</main>
		</>
	);
}
