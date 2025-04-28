import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
	await prisma.course.createMany({
		data: [
			{
				content:
					'{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				description: 'Curso de formação em Yoga',
				id: 'db66f261-f832-4f0b-9565-53d8f8422d51',
				isPublished: true,
				isSelling: true,
				name: 'Formação em Yoga',
				publicationDate: new Date('2024-03-25 17:00:00-03:00'),
				slug: 'formacao-em-yoga-introducao',
				thumbnailUrl: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
				videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			},
			{
				content:
					'{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				description: 'Aulas e Treinamentos de Yoga',
				id: '750c5893-e395-411c-8438-1754e1fd0663',
				isPublished: true,
				isSelling: true,
				name: 'Escola Online',
				publicationDate: new Date('2024-03-25 18:00:00-03:00'),
				slug: 'escola-online',
				thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			},
			{
				content:
					'{"ops":[{"insert":"agora esse curso tem um conteúdo com "},{"attributes":{"link":"https://claushaas.dev"},"insert":"link"},{"insert":"\\n"}]}',
				description:
					'Yoga para Iniciantes lkjh lkjh lkjh lkjh lkjh lkj hlkjh lkjh ',
				id: '8c49ad51-dcb3-4a69-bbeb-2f95970194ae',
				isPublished: true,
				isSelling: true,
				name: 'Yoga para Iniciantes',
				publicationDate: new Date('2024-04-10 18:00:00-03:00'),
				slug: 'yoga-para-iniciantes',
				thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			},
		],
	});

	await prisma.course.update({
		data: {
			delegateAuthTo: {
				connect: [
					{ slug: 'yoga-para-iniciantes' },
					{ slug: 'escola-online' },
					{ slug: 'formacao-em-yoga-introducao' },
				],
			},
		},
		where: {
			slug: 'yoga-para-iniciantes',
		},
	});

	await prisma.course.update({
		data: {
			delegateAuthTo: {
				connect: [
					{ slug: 'escola-online' },
					{ slug: 'formacao-em-yoga-introducao' },
				],
			},
		},
		where: {
			slug: 'escola-online',
		},
	});

	await prisma.course.update({
		data: {
			delegateAuthTo: {
				connect: { slug: 'formacao-em-yoga-introducao' },
			},
		},
		where: {
			slug: 'formacao-em-yoga-introducao',
		},
	});

	await prisma.module.create({
		data: {
			courses: {
				create: {
					courseSlug: 'formacao-em-yoga-introducao',
					isPublished: true,
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			description: 'Introdução ao Yoga',
			id: '16c63aa1-8122-4327-a990-56ec2e636808',
			isLessonsOrderRandom: false,
			name: 'Módulo 1',
			slug: 'modulo-1',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
		},
	});

	await prisma.module.create({
		data: {
			courses: {
				create: {
					courseSlug: 'escola-online',
					id: undefined,
					isPublished: true,
					order: 2,
					publicationDate: new Date('2024-03-25 18:30:00'),
				},
			},
			description: 'Práticas de Yoga',
			id: '0a609d33-97e1-4400-bd64-4834c8387950',
			isLessonsOrderRandom: false,
			name: 'Aulas Práticas',
			slug: 'aulas-praticas',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
		},
	});

	await prisma.tagOptionTagValue.create({
		data: {
			tagOption: {
				connectOrCreate: {
					create: {
						name: 'Dificuldade',
					},
					where: {
						name: 'Dificuldade',
					},
				},
			},
			tagValue: {
				connectOrCreate: {
					create: {
						name: 'Iniciante',
					},
					where: {
						name: 'Iniciante',
					},
				},
			},
		},
	});

	await prisma.tagOptionTagValue.create({
		data: {
			tagOption: {
				connectOrCreate: {
					create: {
						name: 'Dificuldade',
					},
					where: {
						name: 'Dificuldade',
					},
				},
			},
			tagValue: {
				connectOrCreate: {
					create: {
						name: 'Avançado',
					},
					where: {
						name: 'Avançado',
					},
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			id: 'd9fd2efe-ee41-45d6-25a5-4ec50aad7000',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 1',
			slug: 'aula-1',
			tags: {
				connect: {
					tag: {
						tagOptionName: 'Dificuldade',
						tagValueName: 'Iniciante',
					},
				},
			},
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:40:00'),
				},
			},
			name: 'Aula 2',
			slug: 'aula-2',
			tags: {
				connect: {
					tag: {
						tagOptionName: 'Dificuldade',
						tagValueName: 'Avançado',
					},
				},
			},
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 3',
			slug: 'aula-3',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 4',
			slug: 'aula-4',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 5',
			slug: 'aula-5',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 6',
			slug: 'aula-6',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 7',
			slug: 'aula-7',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 8',
			slug: 'aula-8',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 9',
			slug: 'aula-9',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 10',
			slug: 'aula-10',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 11',
			slug: 'aula-11',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 12',
			slug: 'aula-12',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 13',
			slug: 'aula-13',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 14',
			slug: 'aula-14',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 15',
			slug: 'aula-15',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 16',
			slug: 'aula-16',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 17',
			slug: 'aula-17',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 18',
			slug: 'aula-18',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 19',
			slug: 'aula-19',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.lesson.create({
		data: {
			description: 'Aula de Yoga',
			modules: {
				create: {
					isPublished: true,
					moduleSlug: 'aulas-praticas',
					order: 1,
					publicationDate: new Date('2024-03-25 17:30:00'),
				},
			},
			name: 'Aula 20',
			slug: 'aula-20',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
		},
	});

	await prisma.userSubscriptions.create({
		data: {
			courseSlug: 'escola-online',
			expiresAt: new Date('2026-04-25 17:30:00'),
			provider: 'iugu',
			providerSubscriptionId: '123',
			userId: 'c4f35074-cfb4-4fba-973e-9be9846fbf4e',
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
