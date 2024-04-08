import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
	await prisma.course.createMany({
		data: [
			{
				id: 'db66f261-f832-4f0b-9565-53d8f8422d51',
				name: 'Formação em Yoga',
				slug: 'formacao-em-yoga',
				description: 'Curso de formação em Yoga',
				thumbnailUrl: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
				publicationDate: new Date('2024-03-25 17:00:00-03:00'),
				content: '{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
			},
			{
				id: '750c5893-e395-411c-8438-1754e1fd0663',
				name: 'Escola Online',
				slug: 'escola-online',
				description: 'Aulas e Treinamentos de Yoga',
				thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
				publicationDate: new Date('2024-03-25 18:00:00-03:00'),
			},
		],
	});

	await prisma.module.create({
		include: {
			course: true,
		},
		data: {
			id: '16c63aa1-8122-4327-a990-56ec2e636808',
			name: 'Módulo 1',
			slug: 'modulo-1',
			description: 'Introdução ao Yoga',
			thumbnailUrl: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
			publicationDate: new Date('2024-03-25 17:30:00'),
			course: {
				connect: {
					name: 'Formação em Yoga',
				},
			},
		},
	});

	await prisma.module.create({
		include: {
			course: true,
		},
		data: {
			id: '0a609d33-97e1-4400-bd64-4834c8387950',
			name: 'Aulas Práticas',
			slug: 'aulas-praticas',
			description: 'Práticas de Yoga',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			publicationDate: new Date('2024-03-25 18:30:00'),
			course: {
				connect: {
					name: 'Escola Online',
				},
			},
		},
	});
};

try {
	await main();
	await prisma.$disconnect();
} catch (error) {
	console.error(error);
	await prisma.$disconnect();
}
