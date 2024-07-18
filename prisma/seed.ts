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

	await prisma.course.update({
		where: {
			slug: 'yoga-para-iniciantes',
		},
		data: {
			delegateAuthTo: {
				connect: [
					{slug: 'yoga-para-iniciantes'},
					{slug: 'escola-online'},
					{slug: 'formacao-em-yoga'},
				],
			},
		},
	});

	await prisma.course.update({
		where: {
			slug: 'escola-online',
		},
		data: {
			delegateAuthTo: {
				connect: [
					{slug: 'escola-online'},
					{slug: 'formacao-em-yoga'},
				],
			},
		},
	});

	await prisma.course.update({
		where: {
			slug: 'formacao-em-yoga',
		},
		data: {
			delegateAuthTo: {
				connect: {slug: 'formacao-em-yoga'},
			},
		},
	});

	await prisma.module.create({
		data: {
			id: '16c63aa1-8122-4327-a990-56ec2e636808',
			name: 'Módulo 1',
			slug: 'modulo-1',
			description: 'Introdução ao Yoga',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			isLessonsOrderRandom: false,
			courses: {
				create: {
					courseSlug: 'formacao-em-yoga',
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
					courseSlug: 'escola-online',
					isPublished: true,
					publicationDate: new Date('2024-03-25 18:30:00'),
					order: 2,
				},
			},
		},
	});

	await prisma.tagOptionTagValue.create({
		data: {
			tagOption: {
				connectOrCreate: {
					where: {
						name: 'Dificuldade',
					},
					create: {
						name: 'Dificuldade',
					},
				},
			},
			tagValue: {
				connectOrCreate: {
					where: {
						name: 'Iniciante',
					},
					create: {
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
					where: {
						name: 'Dificuldade',
					},
					create: {
						name: 'Dificuldade',
					},
				},
			},
			tagValue: {
				connectOrCreate: {
					where: {
						name: 'Avançado',
					},
					create: {
						name: 'Avançado',
					},
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
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
			tags: {
				connect: {
					tag: {
						tagOptionName: 'Dificuldade',
						tagValueName: 'Iniciante',
					},
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 2',
			slug: 'aula-2',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:40:00'),
					order: 1,
				},
			},
			tags: {
				connect: {
					tag: {
						tagOptionName: 'Dificuldade',
						tagValueName: 'Avançado',
					},
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 3',
			slug: 'aula-3',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 4',
			slug: 'aula-4',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 5',
			slug: 'aula-5',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 6',
			slug: 'aula-6',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 7',
			slug: 'aula-7',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 8',
			slug: 'aula-8',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 9',
			slug: 'aula-9',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 10',
			slug: 'aula-10',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 11',
			slug: 'aula-11',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 12',
			slug: 'aula-12',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 13',
			slug: 'aula-13',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 14',
			slug: 'aula-14',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 15',
			slug: 'aula-15',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 16',
			slug: 'aula-16',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 17',
			slug: 'aula-17',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 18',
			slug: 'aula-18',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 19',
			slug: 'aula-19',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
					isPublished: true,
					publicationDate: new Date('2024-03-25 17:30:00'),
					order: 1,
				},
			},
		},
	});

	await prisma.lesson.create({
		data: {
			name: 'Aula 20',
			slug: 'aula-20',
			description: 'Aula de Yoga',
			videoSourceUrl: 'd4d143774ac00547befe64063fc8f7e2',
			thumbnailUrl: '78c0c3ab-7da6-46e8-742e-fd0e4b08b900',
			modules: {
				create: {
					moduleSlug: 'aulas-praticas',
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
