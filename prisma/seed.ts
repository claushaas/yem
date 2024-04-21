import {type Prisma, PrismaClient} from '@prisma/client';

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
				videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
				publicationDate: new Date('2024-03-25 17:00:00-03:00'),
				content: '{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				isPublished: true,
				isSelling: true,
			},
			{
				id: '750c5893-e395-411c-8438-1754e1fd0663',
				name: 'Escola Online',
				slug: 'escola-online',
				description: 'Aulas e Treinamentos de Yoga',
				thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
				publicationDate: new Date('2024-03-25 18:00:00-03:00'),
				content: '{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				isPublished: true,
				isSelling: true,
			},
			{
				id: '8c49ad51-dcb3-4a69-bbeb-2f95970194ae',
				name: 'Yoga para Iniciantes',
				slug: 'yoga-para-iniciantes',
				description: 'Yoga para Iniciantes lkjh lkjh lkjh lkjh lkjh lkj hlkjh lkjh ',
				thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
				publicationDate: new Date('2024-04-10 18:00:00-03:00'),
				content: '{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				isPublished: true,
				isSelling: true,
			},
		],
	});

	await prisma.module.create({
		data: {
			id: '16c63aa1-8122-4327-a990-56ec2e636808',
			name: 'Módulo 1',
			slug: 'modulo-1',
			description: 'Introdução ao Yoga',
			thumbnailUrl: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
			isLessonsOrderRandom: false,
			courses: {
				create: {
					courseId: 'db66f261-f832-4f0b-9565-53d8f8422d51',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.module.create({
		data: {
			id: '0a609d33-97e1-4400-bd64-4834c8387950',
			name: 'Aulas Práticas',
			slug: 'aulas-praticas',
			description: 'Práticas de Yoga',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			isLessonsOrderRandom: false,
			courses: {
				create: {
					id: undefined,
					courseId: 'db66f261-f832-4f0b-9565-53d8f8422d51',
					isPublished: true,
					publicationDate: new Date('2024-03-25 18:30:00'),
					order: 2,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			id: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
			name: 'Aula 1',
			slug: 'aula-1',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleId: '16c63aa1-8122-4327-a990-56ec2e636808',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
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
