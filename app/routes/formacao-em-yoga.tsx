import {Stream} from '@cloudflare/stream-react';
import {
	BookmarkIcon, CheckCircleIcon, HeartIcon, PlayIcon, UserGroupIcon, VideoCameraIcon,
} from '@heroicons/react/24/outline';
import {type LoaderFunctionArgs, Link, type MetaFunction} from 'react-router';
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {FormationBonusCard} from '~/components/formation-bonus-card';
import {Testimonies} from '~/layouts/testimonies';

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Formação em Yoga - Yoga em Movimento'},
	{name: 'description', content: 'O curso de Formação em Yoga mais abrangente do Brasil. Com aulas práticas e teóricas, você se tornará um professor de Yoga completo.'},
	...data!.meta,
];

export const loader = ({request}: LoaderFunctionArgs) => ({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/formacao-em-yoga', request.url).toString()}],
});

export default function Formacao() {
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
					<Button
						type={ButtonType.Button}
						preset={ButtonPreset.Primary}
						text='Começar Agora'
					/>
				</div>
			</header>
			<main>
				<section id='welcome' className='2xl:max-w-screen-xl max-w-[90%] mx-auto mt-10'>
					<h1 className='text-center mb-5'>Tudo o que você precisa para se tornar uma Instrutora de Yoga, do Zero aos Primeiros Alunos</h1>
					<Stream
						controls
						autoplay
						preload='auto'
						className='pt-[56.25%] relative *:absolute *:w-full *:h-full *:top-0 *:left-0 *:inset-0'
						src='6a99796454a960470c8fd444af82b9fe'
						responsive={false}
					/>
				</section>

				<Testimonies/>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center'>Conheça a sua Escola</h2>
					<p className='my-3 font-gothamMedium'>A Yoga em Movimento surgiu em 2010 no interior de São Paulo do sonho de seus fundadores de espargir esse estilo de vida baseado na saúde e no autoconhecimento para cada vez mais pessoas através do yoga.</p>
					<p className='my-3 font-gothamMedium'>Em 2015 Nossa Escola migrou 100% para o formato online, pois percebemos que essa é a melhor forma de chegar a mais pessoas e de forma acessível!</p>
					<p className='my-3 font-gothamMedium'>Desde então, nossa equipe de professores, que conta com décadas de experiência na formação de instrutores de yoga, já formou mais de MIL professores. Somando nossa Escola Online, já passaram mais de 14 mil alunos pela nossa escola.</p>
					<p className='my-3 font-gothamMedium'>Hoje entendemos que a melhor forma de dar continuidade a nossa missão é formar mais professores de sucesso, pois assim multiplicamos a nossa capacidade de divulgar e transmitir essa filosofia de vida tão bela.</p>
					<p className='my-3 font-gothamMedium'>Nós conhecemos todos os desafios que envolvem essa carreira e por isso apresentamos este curso de Formação em Yoga, e dividimos a estrutura do curso em 3 pilares essenciais para qualquer professor, que já se dedica a esta carreira ou que ainda vai começar: a Filosofia, o Magistério e a Profissão.</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
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

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Para quem é?</h2>

					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem quer ser Professor de Yoga</span> e entende a importância de não só aprender sobre a filosofia e o magistério do Yoga, mas também quer ter sucesso nesta carreira</p>
					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem já é Professor de alguma Modalidade de Yoga</span> e sente que a sua formação não foi completa. A maioria dos cursos de formação abordam apenas uma modalidade e muitas vezes não contemplam nem mesmo todas as técnicas do Yoga. Neste curso você poderá aprender o panorama geral e completo</p>
					<p className='my-3 font-gothamMedium'><span className='font-gothamBold text-purple-8'>Para quem não quer ser Professor de Yoga</span> e percebeu que chegou num estágio da prática em que sente necessidade de se aprofundar na filosofia do Yoga para consolidar o aprendizado que obteve através da prática</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Quais são os Pré-Requisitos para Participar?</h2>

					<p className='my-3 font-gothamMedium'>Apenas a vontade de aprender e compartilhar esta incrível Filosofia de Vida Prática.</p>
					<p className='my-3 font-gothamMedium'>Você não precisa ter experiência prévia no Yoga para iniciar a Nossa Formação.</p>
					<p className='my-3 font-gothamMedium'>Embora a experiência prática seja muito importante para o professor, você terá acesso a mais de 1500 aulas práticas da nossa escola (mais informações abaixo nos bônus) para começar a sua trilha no Yoga e acumular bastante experiência prática ao longo do curso!</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2 className='text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl text-left mb-5'>Bônus Gratuitos</h2>

					<p>Diversos conteúdos e conhecimentos são enriquecedores para o Professor de Yoga, embora não sejam fundamentais na sua formação. Para formar profissionais completos e que possam entrar no mercado de trabalho com segurança, oferecemos diversos bônus inteiramente gratuitos em nosso curso. Estes conteúdos são acessíveis apenas através deste curso e não estão disponíveis de nenhuma outra forma</p>

					<div className='flex flex-wrap gap-5 justify-evenly my-10'>
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
					<p>Além disso, você contará com o feedback dos professores em todas as suas tarefas até o momento em que estiver pronta para as avaliações finais.</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2>O Que Você Vai Receber ao se Matricular</h2>
					Módulos de Filosofia
					com tudo o que você precisa entender sobre Yoga

					Módulos de Magistério
					para aprender a ministrar aulas cativantes e eficientes

					Módulos de Profissão
					para planejar sua carreira e conquistar o sucesso

					Suporte com Equipe de Professores
					para te ajudar em cada etapa dos estudos

					Acesso à Escola Online
					com mais de 1500 aulas práticas para manter sua prática em dia e inspirar suas aulas.

					Todo o Material Didático Incluso
					Você não precisa adquirir nenhum material extra para completar sua formação e receber seu certificado

					Certificado Emitido Gratuitamente
					para aprender a ministrar aulas cativantes e eficientes

					Ebook de Ásanas
					com ilustrações, nomes, variações e explicações das técnicas corporais do Yoga. Novas posições são adicionadas mensalmente

					Todos os Cursos Bônus
					mostrados na página inteiramente gratuitos e com acesso vitalício

					Bibliografia recomendada
					mostrados na página inteiramente gratuitos e com acesso vitalício
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2>Investimento</h2>
					De R$ 5.980,00 por apenas

					12x de 97,00 por ano

					<p>A matrícula em nosso curso curso custa R$ 5.980,00. Mas entendemos que o momento atual não permite que muitas pessoas possam participar de cursos tão completos como o nosso.</p>
					<p>Por isso resolvemos criar uma alternativa de matrícula no formato de assinatura, com duração de 1 ano e valor anual de R$ 1.164,00, ou seja, R$ 97,00 por mês.</p>
					<p>Você pode cancelar a renovação da anuidade quando quiser.</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2>Garantia Incondicional de 7 Dias</h2>
					<p>Você pode entrar, acessar todo o conteúdo e bônus e, se não se adaptar, entender que não é para você ou até mesmo se arrepender nos primeiros 7 dias, devolvemos 100% do seu dinheiro investido. Simples assim, sem complicações ou letras miúdas.</p>
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					<h2>Conteúdo do Curso</h2>

					Filosofia
					Em primeiro lugar, para ser um bom professor, você precisa conhecer a filosofia do Yoga. Isso significa conhecer o contexto cronológico e cultural do Yoga, quando e onde surgiu, como evelouiu e mudou ao longo dos milênios. Precisa entender os conceitos filosóficos e práticos das técnicas, como funcionam, o que proporcionam ao praticante. Nesse pilar você vai encontrar os seguintes conteúdos:
					1. Introdução
					1.1. O que é o Yoga e as suas definições
					1.2 Qual é a meta e os objetivos do Yoga
					1.3 Origens do Yoga
					1.4. Técnicas do Yoga
					1.5. Sistema Clássico de Patáñjáli
					1.6. As diversas modalidades de Yoga
					1.7. Modalidades de Yoga da atualidade
					2. Chakras e Nadís
					2.1. O que são os Chakras
					2.2. As 3 principais Nadís
					2.3 Estimulando os Chakras
					2.4. Granthis
					3. Yoga Sutra de Patáñjáli
					3.1. Introdução ao Yoga Sutra
					3.2. Resumo das trilhas
					4. Alimentação no Yoga
					5. Técnicas do Yoga
					5.1. Mudrá
					5.2. Pújá
					5.3. Mantra
					5.4. Kriyá
					5.5. Ásana
					5.6. Pránáyáma
					5.7. Yoganidrá
					5.8. Samyama
					4.9. Os 4 últimos angas
					6. O Código de Ética do Yoga
					6.1. Yamas
					6.2. Nyamas
					6.3. Yamas e Nyamas como ferramentas de evolução
					7. Hinduismo
					7.1. Karma e Dharma
					7.2. Sámkhya e Vedanta
					7.3. Literatura
					7.4. Sânscrito
					7.5. Tantra e Brahmachárya

					Magistério
					Entender, praticar e aplicar a Filosofia do Yoga na sua vida é muito importante como professor, afinal nada melhor do que a própria experiência para que os seus ensinamentos sejam realmente impactantes. No entanto nada adianta saber tudo sobre Yoga, ser o melhor e mais assíduo praticante, se você não souber como transmitir estes conhecimentos aos seus alunos. Apenas com uma boa didática e pedagogia, aliados ao conhecimento e à empatia para entender o momento de vida de cada aluno seu, suas vontades e objetivos, é que você conseguirá ser a ponte entre o seu aluno e a filosofia do Yoga. Não basta conhecer o Yoga, precisa saber ensinar o Yoga. E é isso que você vai aprender nesse pilar:
					- Objetivos dos Alunos
					- Como introduzir o aluno novo
					- Como acompanhar a evolução dos seus alunos
					- Como montar a sua sala de práticas
					- As diversas variações das técnicas
					- Opções e tipos de aulas de Yoga
					- Aprimorando a execução das técnicas
					- Yoga em círculo
					- Yoga em duplas
					- A melhor forma de demonstrar as técnicas
					- Como ensinar seus alunos a praticarem com segurança
					- Como encadear as técnicas
					- Combinação de técnicas
					- Músicas nas aulas
					- Como aprimorar a sua locução
					- Como corrigir os seus alunos

					Profissão
					Conhecer, vivenciar e saber transmitir a filosofia do Yoga de forma profunda vai lhe tornar um ótimo professor, mas não um professor de sucesso! Pode soar estranho ler isso numa página divulgando um curso de formação, mas não queremos apenas te formar, queremos que você tenha sucesso nesta carreira. E para isso você precisa ter alunos, muitos alunos! Nós vamos pegar na sua mão e te ensinar como iniciar esta carreira, como se formalizar, como planejar, divulgar e matricular os seus alunos, e por aí vai:
					Como é a regulamentação da profissão
					Como se formalizar e atuar como professor de yoga
					Como e que tipo de conteúdos produzir
					Entender a jornada dos seus alunos
					Como divulgar o seu trabalho
					Como precificar o seu trabalho
					Como planejar as receitas e as despesas
					Como usar as redes sociais para divulgação
					Como fazer o atendimento de um interessado
					Como fazer a matrícula de um aluno novo
				</section>

				<section className='2xl:max-w-screen-xl max-w-[90%] mx-auto my-20 sm:my-40'>
					Perguntas Frequentes
					O curso é baseado em alguma modalidade específica de Yoga?
					É um curso de Formação em Yoga, não de uma modalidade específica. Estudaremos os elementos que constituem todas as principais modalidades da atualidade. (Hatha Yogam Ashtánga Yoga, Yoga integral, Swásthya Yoga…). No final do curso você poderá ministrar aulas de uma modalidade com a qual se identifique mais ou, assim como nós, ministrar aulas simplesmente de Yoga. Sem nomes ou rótulos.
					Como são as provas de avaliação?
					A avaliação final é feita em duas etapas. A primeira é uma prova teórica, baseada no conteúdo estudado ao longo do curso, feita diretamente na área de alunos da formação no nosso site. A segunda é uma aula prática ministrada pelo aluno, com duração entre 30 e 45 minutos. Essa aula deverá ser gravada em vídeo (pode ser pelo celular, notebook ou qualquer outra câmera) e enviada para os professores avaliarem e posteriormente enviarem o feedback.
					E se eu não puder participar das aulas ao vivo?
					Nenhum problema! As aulas transmitidas por videoconferência serão gravadas e disponibilizadas para os alunos assistirem quantas vezes quiserem, assim como todas as outras.
					O curso oferece um certificado? Poderei dar aulas de Yoga na minha cidade? Mesmo morando em outro país?
					Ao término do curso, os alunos aprovados na avaliação final receberão o certificado internacional de instrutor de Yoga e poderão ministrar aulas em todo o território nacional e até mesmo no exterior.
					Terei que comprar algum livro ou outro material didático?
					Não, você não precisará investir nada além do valor do curso. Oferecemos a nossos alunos um material de apoio já incluído no valor do curso. São vários e-books que facilitarão os estudos e se tornarão excelentes fontes de consulta ao longo de toda a carreira de Instrutor de Yoga. Também temos uma bibliografia recomendada com muitos títulos de autores sérios e renomados do mundo do Yoga
					Quanto tempo terei para fazer o curso?
					O acesso ao curso é vitalício, ou seja, você pode estudar no seu ritmo e finalizar ele quando quiser. Enquanto o Yoga em Moivmento existir, garantimos esta condição.
					Qual o valor do curso?
					O valor do curso é de R$ 5.980,00. Sem dúvidas um investimento muito baixo para um curso tão completo e que proporcionará a você a oportunidade de ministrar aulas de Yoga, realizar um sonho e ainda ser remunerado por isso. Mas atenção, inscritos nos primeiros lotes tem desconto por antecedência, confira o lote atual e não perca esta oportunidade.
				</section>
			</main>
		</>
	);
}
