/** biome-ignore-all lint/correctness/useUniqueElementIds: . */
/** biome-ignore-all lint/style/noNonNullAssertion: . */
import { Image } from '@unpic/react';
import {
	Link,
	type LoaderFunctionArgs,
	type MetaArgs,
	useLoaderData,
} from 'react-router';
import { Button, ButtonPreset, ButtonType } from '~/components/button';
import { NavigateBar } from '~/components/navigation-bar.js';
import { Testimonies } from '~/layouts/testimonies.js';
import { History } from '~/layouts/yem-history.js';
import type { TypeUserSession } from '~/types/user-session.type';
import { buildImgSource } from '~/utils/build-cloudflare-image-source.js';
import { getUserSession } from '~/utils/session.server';

export const meta = ({ data }: MetaArgs<typeof loader>) => [
	{ title: 'Yoga em Movimento' },
	{
		content:
			'Pratique Yoga com mais de 1500 aulas sem sair de casa e torne-se um professor de Yoga certificado.',
		name: 'description',
	},
	...data!.meta,
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userSession = await getUserSession(request.headers.get('Cookie'));

	return {
		meta: [
			{
				href: new URL('/', request.url).toString(),
				rel: 'canonical',
				tagName: 'link',
			},
		],
		userData: userSession.data as TypeUserSession,
	};
};

export default function Index() {
	const { userData } = useLoaderData<typeof loader>();
	return (
		<>
			<NavigateBar userData={userData} />
			<main>
				<section
					className="flex max-w-[90%] mx-auto my-20 sm:my-32 py-12 items-start gap-14 justify-center"
					id="welcome"
				>
					<div className="sm:max-w-[50%]">
						<h1 className="text-3xl xs:text-5xl xl:text-7xl text-left mb-4 text-purple-11">
							Transforme sua vida com a prática do Yoga, onde quer que esteja.
						</h1>
						<h2 className="text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-8">
							Bem-vindo ao Yoga em Movimento.
						</h2>
					</div>
					<div>
						<Image
							alt="Mulher praticando Yoga"
							cdn="cloudflare_images"
							className="hidden sm:block"
							height={400}
							layout="constrained"
							src={buildImgSource('0bccd83e-9399-4753-5093-468094deed00')}
							width={400}
						/>
					</div>
				</section>
				<Testimonies />

				<section
					className="my-20 sm:my-40 max-w-[95%] sm:max-w-[90%] mx-auto flex justify-center"
					id="services"
				>
					<div className="max-w-(--breakpoint-lg) w-full">
						<h1 className="text-purple-11 text-3xl xs:text-5xl md:text-6xl lg:text-7xl mb-5 text-center">
							Conheça nossos Serviços
						</h1>

						<div className="flex justify-center flex-wrap gap-10">
							<div className="w-60 shrink-0 p-5 shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 rounded-2xl flex flex-col justify-center items-center gap-5">
								<h2 className="text-center">Escola Online</h2>
								<p>
									Para praticar Yoga todos os dias, onde estiver e quando
									quiser.
								</p>
								<Link to="/escola-online">
									<Button
										preset={ButtonPreset.Primary}
										text="Conhecer Agora"
										type={ButtonType.Button}
									/>
								</Link>
							</div>

							<div className="w-60 shrink-0 p-5 shadow-xs shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-4 dark:bg-mauvedark-3 rounded-2xl flex flex-col justify-center items-center gap-5">
								<h2 className="text-center">Formação em Yoga</h2>
								<p>Para se formar como Instrutor de Yoga certificado.</p>
								<Link to="/formacao-em-yoga">
									<Button
										preset={ButtonPreset.Primary}
										text="Conhecer Agora"
										type={ButtonType.Button}
									/>
								</Link>
							</div>
						</div>
					</div>
				</section>

				<History />
			</main>
		</>
	);
}
