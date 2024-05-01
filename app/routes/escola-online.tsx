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
import {Button, ButtonPreset, ButtonType} from '~/components/button.js';
import {Testimonies} from '~/layouts/testimonies.js';
import {History} from '~/layouts/yem-history.js';

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
			<section id='welcome'>
				<div>
					<h1>A Maior Escola de Yoga do Brasil</h1>
					<h2>Na Hora Você Quiser</h2>
					<h2>Onde Você Estiver</h2>
				</div>
				<div>
					<h3>Viva os benefícios do Yoga para o seu Corpo, Mente e Emoções, e se transforme na Sua Melhor Versão</h3>
				</div>
				<div>
					<Button type={ButtonType.Button} preset={ButtonPreset.Primary} text='Praticar 7 Dias Grátis'/>
				</div>
			</section>
			<Testimonies/>
			<History/>
			<section id='platform'>
				<h1>A Plataforma da Yoga em Movimento evoluiu e foi repensada especialmente para a prática do Yoga</h1>
				<div className='flex justify-center gap-4'>
					<div className='flex flex-col items-center'>
						<CheckCircleIcon className='size-32'/>
						<h2 className='text-center'>Acompanhe suas aulas assistidas</h2>
					</div>
					<div className='flex flex-col items-center'>
						<HeartIcon className='size-32'/>
						<h2 className='text-center'>Guarde suas aulas favoritas</h2>
					</div>
					<div className='flex flex-col items-center'>
						<BookmarkIcon className='size-32'/>
						<h2 className='text-center'>Salve aulas para assistir mais tarde</h2>
					</div>
				</div>
				<div className='flex justify-center gap-4'>
					<div className='flex flex-col items-center'>
						<VideoCameraIcon className='size-32'/>
						<h2 className='text-center'>Mais de 1650 aulas práticas</h2>
					</div>
					<div className='flex flex-col items-center'>
						<PlayIcon className='size-32'/>
						<h2 className='text-center'>Mais de 610.000 reproduções</h2>
					</div>
					<div className='flex flex-col items-center'>
						<UserGroupIcon className='size-32'/>
						<h2 className='text-center'>Mais de 15.000 alunos</h2>
					</div>
				</div>
			</section>
			<section id='support'>
				<h1>Você sempre terá acompanhamento!</h1>
				<h2>Você pode conversar diretamente com nossos professores pelo whatsapp ou telegram para tirar suas dúvidas</h2>
			</section>
			<section id='duration'>
				<h1>Fica fácil inserir o Yoga na sua rotina diária</h1>
				<h2>Pratique em qualquer horário e escolha aula de acordo com o tempo disponível</h2>
				<h2>Aulas de 15 até 90 minutos</h2>
			</section>
			<section id='objectives'>
				<h1>Alcance seus objetivos no Yoga</h1>
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
				<h2>Filtre as aulas de acordo com sua meta</h2>
				<h3>Força</h3>
				<h3>Flexibilidade</h3>
				<h3>Introspecção</h3>
				<h3>Restaurativa</h3>
				<h3>Purificação</h3>
				<h3>Respiração</h3>
				<h3>Meditação</h3>
				<h3>Relaxamento</h3>
				<h3>Equilíbrio</h3>
				<h3>Vinyasa</h3>
				<h3>Sem Ásanas</h3>
				<h3>Yoga na Cadeira</h3>
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
			<section id='training'>
				<h1>Avance em técnicas específicas</h1>
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
			<section id='theoretical classes'>
				<h1>Vivencia o Yoga de forma intensa</h1>
				<h2>Assista as aulas teóricas para entender como funciona a prática do Yoga. Nada como entender o que você está fazendo para vivenciar as técnicas do Yoga de forma mais intensa e profunda, acelerando seu desenvolvimento no Yoga.</h2>
			</section>
			<section id='courses'>
				<h1>Cursos de Aprofundamento</h1>
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
			<section id='faq'>
				<h1>Perguntas Frequentes</h1>
			</section>
		</main>
	);
}
