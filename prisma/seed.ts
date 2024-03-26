import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
	await prisma.course.createMany({
		data: [
			{
				id: '026c0073-1da1-4eb7-8c6a-bf92734c3651',
				name: 'Formação em Yoga',
				description: 'Curso de formação em Yoga',
				thumbnailUrl: 'https://d1k8tin4cdb6jb.cloudfront.net/formacao_em_yoga-curso.jpg',
				publicationDate: new Date('2024-03-25 17:00:00'),
			},
			{
				id: '0d36f1ba-7e39-406c-95cc-ab11a98a0de0',
				name: 'Escola Online',
				description: 'Aulas e Treinamentos de Yoga',
				thumbnailUrl: 'https://d1k8tin4cdb6jb.cloudfront.net/formacao_em_yoga-curso.jpg',
				publicationDate: new Date('2024-03-25 18:00:00'),
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
			description: 'Introdução ao Yoga',
			thumbnailUrl: 'https://d1k8tin4cdb6jb.cloudfront.net/formacao_em_yoga-curso.jpg',
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
			description: 'Práticas de Yoga',
			thumbnailUrl: 'https://d1k8tin4cdb6jb.cloudfront.net/formacao_em_yoga-curso.jpg',
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
