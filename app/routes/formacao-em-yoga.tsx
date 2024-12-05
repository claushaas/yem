import {Stream} from '@cloudflare/stream-react';
import {
	BookmarkIcon, CheckCircleIcon, HeartIcon, PlayIcon, UserGroupIcon, VideoCameraIcon,
} from '@heroicons/react/24/outline';
import * as Accordion from '@radix-ui/react-accordion';
import {Image} from '@unpic/react';
import {
	type LoaderFunctionArgs, Link, type MetaFunction, useLocation,
} from 'react-router';
import {AccordionItem} from '~/components/accordion';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {FormationBonusCard} from '~/components/formation-bonus-card';
import {FormationContentCard} from '~/components/formation-content-card';
import {Testimonies} from '~/layouts/testimonies';
import {buildImgSource} from '~/utils/build-cloudflare-image-source';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Formação em Yoga - Yoga em Movimento'},
	{name: 'description', content: 'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/formacao-em-yoga', request.url).toString()}],
});

export default function Formacao() {
	const {search} = useLocation();
	const searchParameters = search ? search.split('?')[1].split('&') : [];
	const marketingSearchParameters = searchParameters.filter(searchParameter => searchParameter.includes('utm_'));

	return (
		<>
			<header className='max-xs:max-w-[95%] max-w-[90%] mx-auto my-4 flex justify-between items-center w-[-webkit-fill-available]'>
				<div className='w-72'>
					<div aria-label='Página inicial do Yoga em Movimento' className='inline before:bg-[url("./assets/logo/logo-reduzido-colorido.svg")] sm:before:bg-[url("./assets/logo/logo-retangular-colorido.svg")] max-xs:before:h-14 before:h-20 before:block before:bg-no-repeat'/>
				</div>
				<div className='flex gap-4 flex-wrap justify-end'>
					<Link to='/login' aria-label='Entrar na plataforma do Yoga em Movimento'>
						<Button type={ButtonType.Button} preset={ButtonPreset.Secondary} text='Entrar'/>
					</Link>
					<Link to='#investment' aria-label='Fazer matrícula no curso de Formação em Yoga'>
						<Button
							type={ButtonType.Button}
							preset={ButtonPreset.Primary}
							text='Começar Agora'
						/>
					</Link>
				</div>
			</header>
			<main>
				<section id='welcome' className='2xl:max-w-screen-xl max-w-[90%] mx-auto mt-5 flex flex-col items-center'>
					<h1 className='text-purple-12 text-xl sm:text-3xl md:text-4xl xl:text-5xl text-center mb-5'>Tudo o que você precisa para se tornar uma Instrutora de Yoga, do Zero aos Primeiros Alunos</h1>
					<div className='max-w-screen-lg w-full'>
						<Stream
							controls
							autoplay
							preload='auto'
							className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
							src='6a99796454a960470c8fd444af82b9fe'
							responsive={false}
						/>
					</div>
				</section>

				<Testimonies/>

				<section id='school' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Conheça a sua Escola</h2>
					<p className='my-3 font-gothamMedium'>A Yoga em Movimento surgiu em 2010 no interior de São Paulo do sonho de seus fundadores de espargir esse estilo de vida baseado na saúde e no autoconhecimento para cada vez mais pessoas através do yoga.</p>
					<p className='my-3 font-gothamMedium'>Em 2015 Nossa Escola migrou 100% para o formato online, pois percebemos que essa é a melhor forma de chegar a mais pessoas e de forma acessível!</p>
					<p className='my-3 font-gothamMedium'>Desde então, nossa equipe de professores, que conta com décadas de experiência na formação de instrutores de yoga, já formou mais de MIL professores. Somando nossa Escola Online, já passaram mais de 14 mil alunos pela nossa escola.</p>
					<p className='my-3 font-gothamMedium'>Hoje entendemos que a melhor forma de dar continuidade a nossa missão é formar mais professores de sucesso, pois assim multiplicamos a nossa capacidade de divulgar e transmitir essa filosofia de vida tão bela.</p>
					<p className='my-3 font-gothamMedium'>Nós conhecemos todos os desafios que envolvem essa carreira e por isso apresentamos este curso de Formação em Yoga, e dividimos a estrutura do curso em 3 pilares essenciais para qualquer professor, que já se dedica a esta carreira ou que ainda vai começar: a Filosofia, o Magistério e a Profissão.</p>
				</section>

				<section id='summary' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Formação em Yoga!!</h2>
					<h3 className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-8 mb-4'>Não em uma Modalidade de Yoga</h3>
					<p className='my-3 font-gothamMedium'>Antes de se especializar em alguma modalidade de yoga, é fundamental conhecer os fundamentos gerais do Yoga, sua origem, todas as técnicas e as diversas modalidades (antigas e modernas) que existem.</p>
					<p className='my-3 font-gothamMedium'>Nossa Formação em Yoga conta com os 3 piolares fundamentais para ter sucesso nessa carreira:</p>

					<div className='flex justify-evenly flex-wrap gap-4 my-10'>
						<div className='max-w-80 px-7 py-5 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly'>
							<h3 className='text-center text-purple-11'>1 - Filosofia</h3>
							<p className='font-gothamMedium'>Como surgiu o Yoga e suas modalidades, os textos sagrados, os conceitos fundamentais, as técnicas de meditação, os chakras, a prática de pranayamas, e muito mais.</p>
						</div>

						<div className='max-w-80 px-7 py-5 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly'>
							<h3 className='text-center text-purple-11'>2 - Magistério</h3>
							<p className='font-gothamMedium'>Seja a ponte entre o Yoga e seu aluno: como montar uma aula, como corrigir os alunos, como lidar com as dificuldades, como lidar com os alunos, como lidar com as emoções, ou seja, como ministrar aulas.</p>
						</div>

						<div className='max-w-80 px-7 py-5 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly'>
							<h3 className='text-center text-purple-11'>3 - Profissão</h3>
							<p className='font-gothamMedium'>Trabalhar com Yoga: como se tornar um profissional de sucesso, montar um estúdio, divulgar seu trabalho; como se tornar um professor de Yoga online... Como planejar, divulgar e matricular os seus alunos.</p>
						</div>
					</div>
				</section>

				<section id='target' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Para quem é?</h2>

					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem quer ser Professor de Yoga</span> e entende a importância de não só aprender sobre a filosofia e o magistério do Yoga, mas também quer ter sucesso nesta carreira</p>
					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem já é Professor de alguma Modalidade de Yoga</span> e sente que a sua formação não foi completa. A maioria dos cursos de formação abordam apenas uma modalidade e muitas vezes não contemplam nem mesmo todas as técnicas do Yoga. Neste curso você poderá aprender o panorama geral e completo</p>
					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem não quer ser Professor de Yoga</span> e percebeu que chegou num estágio da prática em que sente necessidade de se aprofundar na filosofia do Yoga para consolidar o aprendizado que obteve através da prática</p>
				</section>

				<section id='prerequisites' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Quais são os Pré-Requisitos para Participar?</h2>

					<p className='my-3 font-gothamMedium'>Apenas a vontade de aprender e compartilhar esta incrível Filosofia de Vida Prática.</p>
					<p className='my-3 font-gothamMedium'>Você não precisa ter experiência prévia no Yoga para iniciar a Nossa Formação.</p>
					<p className='my-3 font-gothamMedium'>Embora a experiência prática seja muito importante para o professor, você terá acesso a mais de 1500 aulas práticas da nossa escola (mais informações abaixo nos bônus) para começar a sua trilha no Yoga e acumular bastante experiência prática ao longo do curso!</p>
				</section>

				<section id='bonus' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Bônus Gratuitos</h2>

					<p className='font-gothamMedium'>Diversos conteúdos e conhecimentos são enriquecedores para o Professor de Yoga, embora não sejam fundamentais na sua formação. Para formar profissionais completos e que possam entrar no mercado de trabalho com segurança, oferecemos diversos bônus inteiramente gratuitos em nosso curso. Estes conteúdos são acessíveis apenas através deste curso e não estão disponíveis de nenhuma outra forma</p>

					<div className='flex flex-wrap gap-8 justify-center my-10'>
						<FormationBonusCard
							title='Escola Online'
							image='1a71c32c-8ef4-46e4-5e89-445d50c2ae00'
							teacher='Diversos Professores'
							description='Acesse mais de 1500 aulas práticas de Yoga para manter sua prática em dia e se inspirar para suas aulas.'
						/>

						<FormationBonusCard
							title='Yoga Personalizado'
							image='e49ddc48-921f-4c28-84d5-b43b39919e00'
							teacher='Prof. Daniel Borges'
							description='Daniel tráz excelentes reflexões sobre a valorização da profissão e ainda como se posicionar melhor no mercado de trabalho.'
						/>

						<FormationBonusCard
							title='Realize-se e Realize Mais'
							image='1e1539d9-3d84-4706-653b-d14890926600'
							teacher='Prof. Ricardo Mallet'
							description='Desvende o seu propósito de vida sob uma ótica empreendedora com este curso.'
						/>

						<FormationBonusCard
							title='Yoga para Gestantes'
							image='8a3cf1ee-a013-4851-506b-bd2c13247c00'
							teacher='Profa. Susana Lopes'
							description='Neste curso descubra como ministrar Aulas de Yoga adaptadas para todas as etapas da gestação, desde a concecpção até o nascimento.'
						/>

						<FormationBonusCard
							title='Yoga para Crianças'
							image='2d004e91-1986-4165-4394-c53553a69b00'
							teacher='Profa. Sandra Santana'
							description='Como adaptar a Metodologia do Yoga para as Crianças. Praticar Yoga ajuda a desenvolver o potencial físico e intelectual dos pimpolhos desde cedo.'
						/>

						<FormationBonusCard
							title='Anatomia dos Ásanas'
							image='c506441d-57b3-493a-5fad-5c7288e03700'
							teacher='Prof. Ricardo Souza'
							description='Ensinar ásanas exige também conhecimentos de anatomia e fisiologia. Descubra como ensinar as técnicas corporais com segurança e competência.'
						/>

						<FormationBonusCard
							title='Anatomia Aplicada ao Yoga'
							image='917e0302-bebe-47d5-cc0f-35fb6a0a9000'
							teacher='Prof. Fernanda Rangel'
							description='O conhecimento de anatomia, principalmente da coluna vertebral, é fundamental para o Prof. de Yoga ensinar seus alunos con confiança e segurança.'
						/>

						<FormationBonusCard
							title='Nutrição Vegetariana'
							image='a590f3bd-be86-418b-8c7f-444598056100'
							teacher='Nutri Shila Minari'
							description='Entenda o fundamental para poder orientar seus alunos de forma correta sobre o sistema alimentar mais recomendado para a prática do Yoga.'
						/>

						<FormationBonusCard
							title='Meditação Guiada'
							image='891e5f4a-4ddd-45b1-62d3-7cd75303df00'
							teacher='Profa. Liana Linhares'
							description='Considerada uma das técnicas mais modernas e eficazes de se praticar a meditação. Entenda os princípios dessa técnica e como aplicar em suas aulas.'
						/>

						<FormationBonusCard
							title='Saúde e Longevidade'
							image='08518c99-983d-4b38-4d6b-da2c7056df00'
							teacher='Dr. Alexandre Garcia'
							description='Como ajudar seus alunos a terem mais saúde, e viverem com mais plenitude em todos os âmbitos de suas vidas.'
						/>

						<FormationBonusCard
							title='Introdução ao Vedanta'
							image='09be8860-9e64-45b0-d120-39e531ea9400'
							teacher='Prof. Luciano Giorgio'
							description='Um dos 6 principais pontos de vista do Hinduísmo. Uma forma se compreender a vida através de uma ótica espiritualista.'
						/>

						<FormationBonusCard
							title='Introdução ao Sânscrito'
							image='b0528ba6-fb40-4aa2-1ea1-e47b9bf2bf00'
							teacher='Prof. Carlos Cardoso'
							description='A língua oficial do yoga, utilizada para nominar técnicas e conceitos do Yoga. Estudar e compreender esta língua faz parte do estudo do Professor de Yoga.'
						/>

						<FormationBonusCard
							title='Movimentação Sutil'
							image='a199dc6e-3375-4c4e-91fd-7a45be223200'
							teacher='Profa. Cherrine Cardoso'
							description='Shiva, criador do Yoga é o Rei do Bailarinos. Descubra como aprimorar sua movimentação e explorar a consciência ao encadear os ásanas.'
						/>

						<FormationBonusCard
							title='Bhuta Shuddi'
							image='2805891e-72d9-4d17-b275-bde925b34100'
							teacher='Profa. Ro de Castro'
							description='Técnicas de limpeza do corpo, da mente e das emoções. Como experimentar períodos de purificação destes elementos e ensinar seus alunos.'
						/>

						<FormationBonusCard
							title='Histórias do Hinduismo'
							image='f2e10ade-95b4-45fa-435c-02bfe5833b00'
							teacher='Prof. André DeRose'
							description='O Prof. André DeRose tráz neste curso aspectos reais sobre o Yoga e a cultura onde ele surgiu.'
						/>

						<FormationBonusCard
							title='Congresso Semana Sem Carne'
							image='db3d856d-b594-43ef-4c24-1e5c75cd7500'
							teacher='Diversos Professores'
							description='Assista a gravação do congresso sobre alimentação vegetariana que reuniu mais de 35 mil participantes.'
						/>

						<FormationBonusCard
							title='Culinária Vegetariana'
							image='9945c6c6-dd54-4163-5b41-d5fcf6152d00'
							teacher='Prof. Claus Haas'
							description='Aprenda a cozinhar pratos deliciosos da culinária vegetariana inspirados em diversas culturas culinárias diferentes.'
						/>
					</div>
				</section>

				<section id='platform' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-40 flex flex-col items-center gap-12'>
					<h1 className='text-center text-amber-11 text-3xl xs:text-5xl'>A Plataforma da Yoga em Movimento evoluiu e foi repensada especialmente para a prática do Yoga</h1>

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

				<section id='support' className='max-w-[95%] sm:max-w-[90%] lg:max-w-screen-lg mx-auto my-20 sm:my-40'>
					<h1 className='text-sky-12 dark:text-sky-10 mb-5 text-3xl xs:text-5xl md:text-6xl lg:text-7xl'>Você sempre terá acompanhamento!</h1>
					<h2 className='text-sky-11 text-2xl xs:text-4xl md:text-5xl lg:text-6xl'>Você pode conversar diretamente com nossos professores pelo whatsapp ou telegram para tirar suas dúvidas</h2>
					<p className='font-gothamMedium'>Além disso, você contará com o feedback dos professores em todas as suas tarefas até o momento em que estiver pronta para as avaliações finais.</p>
				</section>

				<section id='content' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>O Que Você Vai Receber ao se Matricular</h2>

					<div className='max-w-screen-md w-full mx-auto px-7 py-5 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 flex flex-col justify-evenly gap-5'>
						<FormationContentCard
							title='Módulos de Filosofia'
							description='com tudo o que você precisa entender sobre Yoga'
						/>

						<FormationContentCard
							title='Módulos de Magistério'
							description='para aprender a ministrar aulas cativantes e eficientes'
						/>

						<FormationContentCard
							title='Módulos de Profissão'
							description='para planejar sua carreira e conquistar o sucesso'
						/>

						<FormationContentCard
							title='Suporte com Equipe de Professores'
							description='para te ajudar em cada etapa dos estudos'
						/>

						<FormationContentCard
							title='Acesso à Escola Online'
							description='com mais de 1500 aulas práticas para manter sua prática em dia e inspirar suas aulas.'
						/>

						<FormationContentCard
							title='Todo o Material Didático Incluso'
							description='Você não precisa adquirir nenhum material extra para completar sua formação e receber seu certificado'
						/>

						<FormationContentCard
							title='Certificado Emitido Gratuitamente'
							description='para aprender a ministrar aulas cativantes e eficientes'
						/>

						<FormationContentCard
							title='Ebook de Ásanas'
							description='com ilustrações, nomes, variações e explicações das técnicas corporais do Yoga. Novas posições são adicionadas mensalmente'
						/>

						<FormationContentCard
							title='Todos os Cursos Bônus'
							description='mostrados na página inteiramente gratuitos'
						/>

						<FormationContentCard
							title='Bibliografia recomendada'
							description='as melhores indicações de livros para ampliar os estudos'
						/>
					</div>
				</section>

				<section id='investment' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:mt-40'>
					<h1 className='text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Investimento</h1>

					<h2 className='text-purple-12 dark:text-purpledark-12 text-center'>De R$ <span className='line-through'>5.980,00</span> por apenas 12x de 97,00 por ano</h2>

					<div className='max-w-screen-md mx-auto'>
						<p className='font-gothamMedium mb-3'>O valor da matrícula em nosso curso curso é R$ 5.980,00. Entendemos que o momento atual não permite que muitas pessoas possam participar de cursos tão completos como o nosso.</p>
						<p className='font-gothamMedium mb-3'>Por isso resolvemos criar uma alternativa de matrícula no formato de assinatura, com duração de 1 ano e valor anual de R$ 1.164,00, ou seja, R$ 97,00 por mês.</p>
						<p className='font-gothamMedium mb-3 text-center'>Você pode cancelar a renovação da anuidade quando quiser.</p>
					</div>

					<div className='mx-auto w-fit my-20'>
						<Link to={`https://pay.hotmart.com/G96565416C?${marketingSearchParameters.join('&')}`} target='_blank'>
							<Button
								type={ButtonType.Button}
								preset={ButtonPreset.Primary}
								text='Fazer Minha Matrícula'
								className='text-2xl'
							/>
						</Link>
					</div>
				</section>

				<section id='guarantee' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:mb-40'>
					<div className='flex max-w-screen-md gap-4 items-center mx-auto flex-wrap sm:flex-nowrap justify-center'>
						<div className='shrink-0'>
							<Image
								className='w-full h-full'
								src={buildImgSource('6dab2385-3610-4d32-35d4-75f1a9bc2c00')}
								cdn='cloudflare_images'
								layout='constrained'
								width={100}
								height={100}
								alt='Garantia Incondicional de 7 Dias'
							/>
						</div>
						<div className='shrink'>
							<h2 className='text-purple-11 dark:text-purpledark-11 text-center sm:text-left text-lg'>Garantia Incondicional de 7 Dias</h2>
							<p className='text-purple-12 dark:text-purpledark-12 font-gothamMedium text-xs'>Você pode entrar, acessar todo o conteúdo e bônus e, se não se adaptar, entender que não é para você ou até mesmo se arrepender nos primeiros 7 dias, devolvemos 100% do seu dinheiro investido. Simples assim, sem complicações ou letras miúdas.</p>
						</div>
					</div>
				</section>

				<section id='curriculum' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Conteúdo do Curso</h2>

					<p className='text-center font-gothamMedium'>Nosso Curso está divido em 3 pilares fundamentais, que são 3 grandes módulos, abaixo estão o conteúdo e o motivo de cada um:</p>

					<div className='flex gap-5 flex-wrap mt-5 justify-center'>
						<div className='w-96 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5'>
							<h3 className='text-purple-11 dark:text-purpledark-11 text-center'>I - Filosofia</h3>

							<p className='mb-4 font-gothamMedium'>Você precisa conhecer a filosofia do Yoga. Isso significa conhecer o contexto cronológico e cultural do Yoga. Entender os conceitos filosóficos e práticos das técnicas, como funcionam, o que proporcionam ao praticante:</p>

							<div className='ml-6'>
								<ol className='list-decimal'>
									<li className='mb-2'>
										<p>Introdução</p>
										<ul className='list-disc'>
											<li><p>O que é o Yoga</p></li>
											<li><p>Meta e objetivos do Yoga</p></li>
											<li><p>Origens do Yoga</p></li>
											<li><p>Técnicas do Yoga</p></li>
											<li><p>Sistema Clássico de Patáñjáli</p></li>
											<li><p>Modalidades de Yoga</p></li>
											<li><p>Modalidades de Yoga da atualidade</p></li>
										</ul>
									</li>
									<li className='mb-2'>
										<p>Chakras e Nadís</p>
										<ul className='list-disc'>
											<li><p>O que são os Chakras</p></li>
											<li><p>As 3 principais Nadís</p></li>
											<li><p>Estimulando os Chakras</p></li>
											<li><p>Granthis</p></li>
										</ul>
									</li>
									<li className='mb-2'>
										<p>Yoga Sutra de Patáñjáli</p>
										<ul className='list-disc'>
											<li><p>Introdução ao Yoga Sutra</p></li>
											<li><p>Resumo das trilhas</p></li>
										</ul>
									</li>
									<li className='mb-2'>
										<p>Alimentação no Yoga</p>
									</li>
									<li className='mb-2'>
										<p>Técnicas do Yoga</p>
										<ul className='list-disc'>
											<li><p>Mudrá</p></li>
											<li><p>Pújá</p></li>
											<li><p>Mantra</p></li>
											<li><p>Kriyá</p></li>
											<li><p>Ásana</p></li>
											<li><p>Pránáyáma</p></li>
											<li><p>Yoganidrá</p></li>
											<li><p>Samyama</p></li>
										</ul>
									</li>
									<li className='mb-2'>
										<p>O Código de Ética do Yoga</p>
										<ul className='list-disc'>
											<li><p>Yamas</p></li>
											<li><p>Nyamas</p></li>
											<li><p>Ferramentas de evolução</p></li>
										</ul>
									</li>
									<li className='mb-2'>
										<p>Hinduísmo</p>
										<ul className='list-disc'>
											<li><p>Karma e Dharma</p></li>
											<li><p>Sámkhya e Vedanta</p></li>
											<li><p>Literatura</p></li>
											<li><p>Sânscrito</p></li>
											<li><p>Tantra e Brahmachárya</p></li>
										</ul>
									</li>
								</ol>
							</div>
						</div>

						<div className='w-96 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5'>
							<h3 className='text-purple-11 dark:text-purpledark-11 text-center'>II - Magistério</h3>

							<p className='mb-4 font-gothamMedium'>Se você não souber como transmitir seus conhecimentos aos seus alunos, seu futuro como Professora não será muito bom. Apenas com uma boa didática e pedagogia é que você conseguirá ser a ponte entre o seu aluno e a filosofia do Yoga. Precisa saber ensinar o Yoga:</p>

							<div className='ml-6'>
								<ul className='list-disc'>
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

						<div className='w-96 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 py-4 px-5'>
							<h3 className='text-purple-11 dark:text-purpledark-11 text-center'>III - Profissão</h3>

							<p className='mb-4 font-gothamMedium'>Não queremos apenas te formar, queremos que você tenha sucesso nesta carreira. Vamos te ensinar como iniciar esta carreira, como se formalizar, como planejar, divulgar e matricular os seus alunos, e por aí vai:</p>

							<div className='ml-6'>
								<ul className='list-disc'>
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

				<section id='faq' className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Perguntas Frequentes</h2>

					<Accordion.Root collapsible type='single' defaultValue='1' className='rounded-xl'>
						<AccordionItem value='1'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>O curso é baseado em alguma modalidade específica de Yoga?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>É um curso de Formação em Yoga, não de uma modalidade específica. Estudaremos os elementos que constituem todas as principais modalidades da atualidade. (Hatha Yogam Ashtánga Yoga, Yoga integral, Swásthya Yoga…). No final do curso você poderá ministrar aulas de uma modalidade com a qual se identifique mais ou, assim como nós, ministrar aulas simplesmente de Yoga. Sem nomes ou rótulos.</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value='2'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Como é feito o acesso?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>Caso ainda não possua cadastro em nossa plataforma, imediatamente após a confirmação da matrícula você receberá um email com a senha de acesso, exclusiva para você.</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value='3'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Como são as provas de avaliação?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>A avaliação final é feita em duas etapas. A primeira é uma prova teórica, baseada no conteúdo estudado ao longo do curso, feita diretamente na área de alunos da formação no nosso site. A segunda é uma aula prática ministrada pelo aluno, com duração entre 30 e 45 minutos. Essa aula deverá ser gravada em vídeo (pode ser pelo celular, notebook ou qualquer outra câmera) e enviada para os professores avaliarem e posteriormente enviarem o feedback.</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value='4'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>O curso oferece um certificado? Posso dar aulas em outros países?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>Ao término do curso, os alunos aprovados na avaliação final receberão o certificado internacional de instrutor de Yoga e poderão ministrar aulas em todo o território nacional e até mesmo no exterior.</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value='5'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Terei que comprar algum livro ou outro material didático?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>Não, você não precisará investir nada além do valor do curso. Oferecemos a nossos alunos um material de apoio já incluído no valor do curso. São vários e-books que facilitarão os estudos e se tornarão excelentes fontes de consulta ao longo de toda a carreira de Instrutor de Yoga. Também temos uma bibliografia recomendada com muitos títulos de autores sérios e renomados do mundo do Yoga.</p>
							</Accordion.Content>
						</AccordionItem>

						<AccordionItem value='6'>
							<Accordion.Header>
								<Accordion.Trigger>
									<p>Posso cancelar a assinatura quando quiser?</p>
								</Accordion.Trigger>
							</Accordion.Header>
							<Accordion.Content>
								<p>Sim! Esse formato de assinatura da nossa formação permite que você faça o cancelamento da renovação da anuidade quando você quiser. Ao cancelar, são interrompidas as próximas renovações da anuidade e o seu acesso continua funcionando normalmente até o final da anuidade atual.</p>
							</Accordion.Content>
						</AccordionItem>
					</Accordion.Root>
				</section>

				<section>
					<h1 className='text-purple-11 dark:text-purpledark-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Ficou alguma dúvida?</h1>
					<h2 className='text-purple-12 dark:text-purpledark-12 text-xl xs:text-3xl md:text-4xl mb-5 text-center'>Entre em contato no <a href='https://wa.me/551149359150' target='_blank' rel='noreferrer'>WhatsApp (11) 4935-9150</a></h2>
				</section>
			</main>
		</>
	);
}
