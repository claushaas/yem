import {
	type LoaderFunctionArgs,
	unstable_defineLoader as defineLoader,
} from '@remix-run/node';
import {useLoaderData, type MetaArgs_SingleFetch} from '@remix-run/react';
import {NavigateBar} from '~/components/navigation-bar.js';
import {type TypeUserSession} from '~/types/user-session.type';
import {getUserSession} from '~/utils/session.server';

export const meta = ({data}: MetaArgs_SingleFetch<typeof loader>) => [
	{title: 'Yoga em Movimento - Termos de Privacidade'},
	{name: 'description', content: 'Termos de Privacidade da Yoga em Movimento.'},
	...data!.meta,
];

export const loader = defineLoader(async ({request}: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return {
		meta: [{tagName: 'link', rel: 'canonical', href: new URL('/termos-de-privacidade', request.url).toString()}],
		userData: userSession.data as TypeUserSession,
	};
});

export default function TermosDePrivacidade() {
	const {userData} = useLoaderData<typeof loader>();

	return (
		<>
			<NavigateBar userData={userData}/>

			<main className='my-20 max-w-[90%] mx-auto'>
				<div className='max-w-screen-md'>
					<h1 className='text-3xl text-center'>Termos de Privacidade</h1>
					<h2 className='text-2xl my-4'>Objetivo</h2>
					<p className='my-4'>Esta página traz a Política de Privacidade da Yoga em Movimento Ltda, em seu site yogaemmovimento.com, compreendendo o acesso através de seus canais oficiais dentro do sítio eletrônico. Sua finalidade é estabelecer as regras de coleta, armazenamento, utilização, tratamento, compartilhamento e exclusão dos dados e informações eventualmente coletadas pela empresa em suas plataformas digitais, com a máxima transparência.</p>
					<p className='my-4'>Pensando nisso, esperamos que você, navegando em nosso site, tenha a melhor experiência possível e que usufrua dos nossos serviços, sempre com a garantia de respeito à sua privacidade. Para isso, suas preferências podem possibilitar um serviço customizado e de acordo com a oferta ou demanda que você procura.</p>
					<p className='my-4'>Nosso objetivo é que todos os esclarecimentos e aspectos práticos necessários para sanar suas dúvidas estejam dispostos de forma clara nesta página.</p>
					<h2 className='text-2xl my-4'>Definições</h2>
					<p className='my-4'>Controlador dos Dados: Yoga em Movimento Ltda, CNPJ: 12.772.498/0001-90, Rua Miguel Ferragut, 140, Bloco E, Ap 2, Bairro Pinheirinho, Vinhedo, SP, Brasil</p>
					<p className='my-4'>Natureza dos dados que serão tratados: Dados pessoais fornecidos pelo usuário e/ou coletados automaticamente.</p>
					<p className='my-4'>Finalidade do tratamento de dados pessoais: Melhorar a experiência de navegação no site, informações institucionais, acompanhamento pedagógico, campanhas publicitárias, descontos, divulgação de eventos, ou para pesquisas.</p>
					<p className='my-4'>Bases legais utilizadas: i) Legítimo interesse, ii) Execução de contratos, iii) Consentimento.</p>
					<p className='my-4'>Compartilhamento: Operadores e fornecedores de serviços essenciais para desenvolver nossas atividades.</p>
					<p className='my-4'>Proteção de dados: Medidas preventivas que visam oferecer a maior segurança e sigilo possível aos seus dados, observando princípios legais, capacidade tecnológica e processos técnicos administrativos.</p>
					<p className='my-4'>Direitos dos titulares: Confirmação da existência de tratamento de dados pessoais, acesso, retificação/correção, eliminação, etc.</p>
					<h2 className='text-2xl my-4'>1 – DOS DADOS UTILIZADOS</h2>
					<p className='my-4'>O site da Yoga em Movimento Ltda, contém todas as informações institucionais da YEM. Em seu escopo, o site se destina àqueles que buscam, essencialmente:</p>
					<ul>
						<li>
							<p className='my-4'>1. Informações sobre os cursos e aulas da Yoga em Movimento Ltda, lançamentos, campanhas ofertadas pela marca e programas de parcerias;</p>
						</li>
						<li>
							<p className='my-4'>2. Sanar dúvidas de visitantes do site da Yoga em Movimento Ltda;</p>
						</li>
						<li>
							<p className='my-4'>3. Sanar dúvidas de clientes da Yoga em Movimento Ltda, que queiram mais informações sobre pós-venda e ou utilizar algum serviço relacionado aos seus cursos.</p>
						</li>
					</ul>
					<p className='my-4'>No decorrer da página explicaremos quais dados serão processados, seus objetivos e por quanto tempo manteremos tais informações. Com esse intuito, há o tratamento de dois tipos de dados pessoais: (i) aqueles tratados por ocasiões de fornecimento pelo próprio usuário; (ii) aqueles coletados automaticamente para otimização do funcionamento do site.</p>
					<ul>
						<li>
							<p className='my-4'>1. Informações fornecidas pelo usuário: A Yoga em Movimento Ltda faz o tratamento de todos os dados informados pelo usuário da sua página, tais como nome completo, endereço, CPF, e-mail, telefone para contato, cidade e estado e, quando houver necessidade, dados que necessitem oportunamente serem preenchidos em formulários que visem o acesso à área do aluno, participação em campanhas, obtenção de descontos, participação em eventos, pesquisas de satisfação e programas de fidelidade.</p>
						</li>
						<li>
							<p className='my-4'>2. Informações coletadas automaticamente: A Yoga em Movimento Ltda também faz o tratamento de alguns dados de forma automática, tais como: IP (Internet Protocol), características do dispositivo de acesso, navegador, informações sobre cliques, páginas e telas que foram acessadas, aulas assistidas, termos procurados dentro do site e o fluxo de navegação dentro do seu sítio eletrônico. Para que tal funcionamento ocorra, a Yoga em Movimento Ltda fará uso de tecnologias existentes e consolidadas no mercado, dentro do padrão necessário e adequado com as melhores práticas, utilizando de cookies, pixel tags, beacons, local shared objects, que serão utilizadas com o foco de proporcionar uma melhor experiência ao navegar pelo sítio eletrônico da empresa, de acordo com o feedback trazido pelas preferências do usuário.</p>
						</li>
					</ul>
					<h2 className='text-2xl my-4'>2 – COMPARTILHAMENTO DE DADOS</h2>
					<p className='my-4'>As informações coletadas acima poderão ser compartilhadas pela Yoga em Movimento Ltda com: (i) empresas parceiras, quando forem necessárias para a adequada prestação de serviços, objetivando a sua finalidade, segurança, adequação e minimização dos dados (Art. 7, incisos I, IX e X da Lei 13.709/2018); (ii) para exercício de normas ou regulamentos (Art. 7, incisos II e III da Lei 13.709/2018); (iii) proteção dos interesses da Yoga em Movimento Ltda em qualquer tipo de conflito (Art. 7, VI e IX e Art. 10 da Lei 13.709/2018); (iv) mediante decisão judicial ou requisição de autoridades competentes (Art. 7, incisos III e VI da Lei 13.709/2018).</p>
					<p className='my-4'>Em prosseguimento, é devido esclarecer que mediante requisitos de Segurança da Informação e, quando possível, de anonimização, também poderão ser compartilhados dados com empresas provedoras de infraestrutura de tecnologia, processos e operacionalização estritamente necessárias para o exercício das atividades da Yoga em Movimento Ltda.</p>
					<p className='my-4'>Os titulares de dados pessoais poderão requerer o acesso, atualização, adição ou retificação de seus dados, bem como poderão solicitar a exclusão dos dados coletados pela Yoga em Movimento Ltda, através do seu encarregado de dados (DPO – Data Protection Officer), no seguinte e-mail administracao@yogaemmovimento.com.</p>
					<p className='my-4'>No corpo do e-mail, o titular de dados deverá fazer constar detalhadamente seu pedido, onde será respondido dentro do menor tempo possível, observando a legislação concernente e orientações posteriores a serem estabelecidas pela ANPD - Autoridade Nacional de Proteção de Dados.</p>
					<h2 className='text-2xl my-4'>3 – POLÍTICA DE COOKIES</h2>
					<p className='my-4'>Cookies são dados no qual o sítio eletrônico (website) solicita ao seu navegador (browser) para armazenar no seu computador ou dispositivo móvel. Os cookies permitem que o website otimize sua navegação, guardando informações sobre o seu fluxo de navegação.</p>
					<p className='my-4'>A maioria dos navegadores da internet possibilitam o uso de cookies, bem como suas configurações. Além disso, os usuários podem navegar através de janelas anônimas ou apagar os cookies a qualquer momento.</p>
					<p className='my-4'>A Yoga em Movimento Ltda utiliza os cookies com a finalidade de personalizar e melhorar a experiência de navegação, bem como a utilização de seus serviços, adequando suas necessidades em compilar as informações sobre seu site, também para melhorar suas estruturas e políticas de navegação.</p>
					<p className='my-4'>Os Cookies podem ser divididos da seguinte maneira, de acordo com suas FINALIDADES:</p>
					<ul>
						<li>
							<p className='my-4'>1. Sessão e Persistentes:de Sessão: são temporários e permanecem ativos até que a página ou o navegador seja fechado. São geralmente utilizados para analisar padrões de tráfego e para proporcionar melhor experiência ao usuário; Persistentes: persistem no navegador mesmo que este seja finalizado. Geralmente, são utilizados para relembrar logins e senhas dos usuários.</p>
						</li>
						<li>
							<p className='my-4'>2. Cookies Proprietários e de Terceiros: Proprietários: são cookies pré-definidos pelo próprio site em que o usuário navega; Terceiros: Em suma, são definidos por partes diferentes do site que você está acessando no momento, utilizando do seu acesso para impulsionamento de análises que serão prospectadas por outras partes.</p>
						</li>
					</ul>
					<p className='my-4'>As informações obtidas acima são filtradas e podem ser categorizadas como alguns tipos de cookies: (i) Necessários, que ajudam a entender como os visitantes interagem com as telas das páginas, fornecendo informações sobre quais as áreas visitadas, tempo de visita e até mesmo erros encontrados; (ii) Funcionais, que permitem ao site lembrar as escolhas feitas pelo usuário, potencializando sua experiência de forma mais adequadas; (iii) Marketing, utilizados com o objetivo de mostrar conteúdos mais relevantes e que correspondem ao interesse do usuário. São utilizados em campanhas de publicidade mais direcionada, mostrando a eficácia e alcance dos anúncios, possibilitando uma melhor análise do seu conteúdo. Podem também mostrar as páginas que você visitou anteriormente.</p>
					<p className='my-4'>Após o usuário consentir com a utilização dos cookies na tela inicial, a Yoga em Movimento Ltda irá utiliza-los da forma que fora demonstrada acima, em total transparência e em atenção à legislação em vigor.</p>
					<p className='my-4'>A Yoga em Movimento Ltda não utiliza nenhum cookie que possa ser considerado invasivo. Ainda assim, o usuário poderá retirar ou alterar a qualquer momento o uso de cookies diretamente em seu navegador. Para isso, procure instruções em seu navegador dentre de configurações com o nome de “ajuda”, “ferramentas” ou “opções”. Alguns dos navegadores mais utilizados no mercado disponibilizam tutoriais sobre como gerir cookies, como demonstrado a seguir:</p>
					<ul>
						<li>
							<p className='my-4'>Internet Explorer: https://support.microsoft.com/pt-br/help/17442/windows-internetexplorer-delete-manage-cookies</p>
						</li>
						<li>
							<p className='my-4'>Google Chrome: https://support.google.com/accounts/answer/61416?co=GENIE.Platform%3DDesktop&hl=pt-BR</p>
						</li>
						<li>
							<p className='my-4'>Mozilla Firefox: https://support.mozilla.org/pt-BR/kb/ative-e-desative-os-cookies-queos-sites-usam</p>
						</li>
						<li>
							<p className='my-4'>Safari: https://support.apple.com/pt-br/guide/safari/sfri11471/mac</p>
						</li>
					</ul>
					<p className='my-4'>É importante ressaltar que o usuário correrá o risco de não receber adequadamente todas as ofertas, campanhas ou funcionalidades que são disponibilizadas a partir de sua navegação, o que facilita e auxilia o usuário no seu processo de pesquisa e compra.</p>
					<h2 className='text-2xl my-4'>4 – MEDIDAS DE SEGURANÇA DE DADOS</h2>
					<p className='my-4'>A Yoga em Movimento Ltda utiliza de tecnologias sofisticadas e condizentes com o mais alto padrão no mercado, armazenando informações coletadas em servidores próprios ou por ela contratados. Para isso, são observadas sempre as melhores práticas, tais como:</p>
					<ul>
						<li>
							<p className='my-4'>1. O uso de criptografias de acesso também é demonstrado, tal como o padrão SSL – Secure Sockets Layer, configurado como site seguro para acesso;</p>
						</li>
						<li>
							<p className='my-4'>2. Proteção contra acesso não autorizado aos seus sistemas;</p>
						</li>
						<li>
							<p className='my-4'>3. Autorização de acesso apenas a pessoas previamente estabelecidas a tratarem as informações coletadas;</p>
						</li>
						<li>
							<p className='my-4'>4. Sigilo de dados, com a minimização de dados coletados e registro de acesso das permissões internas.</p>
						</li>
					</ul>
					<p className='my-4'>Vale ressaltar, que embora os melhores esforços para garantir a privacidade dos usuários seja o escopo da Yoga em Movimento Ltda, o mesmo se aplica aos seus usuários, no qual deverão tomar medidas adequadas para se proteger, mantendo como confidenciais os seus usuários e senhas; utilizar antivírus e, sobretudo, tomar as devidas precauções para garantir seus direitos.</p>
					<p className='my-4'>A fim de garantir a privacidade e sigilo dos dados coletados em nossas páginas, todas as precauções são continuamente tomadas, atendendo a princípios e fundamentos que atendem às normas estabelecidas na ISO/IEC 27001 e 27002, em observância a padrões estabelecidos no Art. 13, do Decreto nº. 8.771/2016 e ao Art. 6, inciso VII, da Lei 13.709.</p>
					<h2 className='text-2xl my-4'>5 – TEMPO DE ARMAZENAMENTO DOS DADOS</h2>
					<p className='my-4'>Os dados pessoais dos usuários tratados pela Yoga em Movimento Ltda serão excluídos quando:</p>
					<ul>
						<li>
							<p className='my-4'>1. O titular de dados solicitar sua eliminação de nossos servidores e banco de dados;</p>
						</li>
						<li>
							<p className='my-4'>2. No decorrer da vida útil da informação (prazo legal de 6 meses previsto no Marco Civil da Internet – artigo 15), para fins legais, conforme interesse legítimo da Yoga em Movimento para sua proteção legal;</p>
						</li>
					</ul>
					<p className='my-4'>Sem prejuízo ao elencado acima, os dados poderão e deverão ser conservados para cumprimento de obrigação legal ou regulatória, transferência a terceiro necessário para execução de contrato – respeitado os requisitos para seu tratamento – sempre que a anonimização for possível.</p>
					<h2 className='text-2xl my-4'>6 – DIREITOS DOS TITULARES DE DADOS</h2>
					<p className='my-4'>Em observância aos princípios éticos, boas práticas e, acima de tudo, em cumprimento a regulamentação que rege o tratamento de dados pessoais no Brasil, a Yoga em Movimento Ltda visará sempre respeitar e garantir a prestação de um serviço de excelência ao usuário, à luz de possibilitar o exercício dos seus direitos e solicitações, que podem dispor da seguinte forma:</p>
					<ul>
						<li>
							<p className='my-4'>1. Acesso aos dados pessoais cadastrados;</p>
						</li>
						<li>
							<p className='my-4'>2. Confirmação da existência de tratamento de dados pessoais, desde sua coleta;</p>
						</li>
						<li>
							<p className='my-4'>3. Retificação de dados cadastrais, seja por estarem desatualizados ou incorretos;</p>
						</li>
						<li>
							<p className='my-4'>4. Anonimizar, restringir ou eliminar dados desnecessários, que não estejam em conformidade com a finalidade e qualidade que afere o fito comercial da empresa;</p>
						</li>
						<li>
							<p className='my-4'>5. Eliminação de dados tratados que tenham sido coletados com base no consentimento do usuário e não, no legítimo interesse;</p>
						</li>
						<li>
							<p className='my-4'>6. Informação sobre quais entidades públicas ou privadas que tem acesso aos dados;</p>
						</li>
						<li>
							<p className='my-4'>7. Portabilidade dos dados, para quando a ANPD – Autoridade Nacional de Proteção de Dados Pessoais regulamentar, de forma adequada, como assim fazê-lo;</p>
						</li>
					</ul>
					<p className='my-4'>A Yoga em Movimento Ltda se reserva ao direito de, após feita a solicitação, requerer todos os meios possíveis para confirmar a titularidade do requisitante, garantindo o retorno com a maior brevidade possível.</p>
					<h2 className='text-2xl my-4'>7 – LEGISLAÇÃO APLICÁVEL</h2>
					<p className='my-4'>Este Documento foi elaborado com a legislação vigente na República Federativa do Brasil, tomando como escopo principal garantir a adequação à Lei 13709/2018.</p>
					<h2 className='text-2xl my-4'>8 – ATUALIZAÇÃO</h2>
					<p className='my-4'>A presente Política de Privacidade foi atualizada em 06 de janeiro de 2021.</p>
				</div>
			</main>
		</>
	);
}
