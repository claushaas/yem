import {json, type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node';
import {Image} from '@unpic/react';
import {buildImgSource} from '~/utils/build-cloudflare-image-source.js';
import {Testimonies} from '~/layouts/testimonies.js';
import {History} from '~/layouts/yem-history.js';

type TLoaderData = {
	meta: Array<{tagName: string; rel: string; href: string}>;
};

export const meta: MetaFunction<typeof loader> = ({data}) => [
	{title: 'Yoga em Movimento'},
	{name: 'description', content: 'Pratique Yoga com mais de 1500 aulas sem sair de casa e torne-se um professor de Yoga certificado.'},
	...data!.meta,
];

export const loader = async ({request}: LoaderFunctionArgs) => json<TLoaderData>({
	meta: [{tagName: 'link', rel: 'canonical', href: new URL('/', request.url).toString()}],
});

export default function Index() {
	return (
		<main>
			<section id='welcome' className='flex max-w-[90%] mx-auto my-20 sm:my-32 py-12 items-start gap-14 justify-center'>
				<div className='sm:max-w-[50%]'>
					<h1 className='text-3xl xs:text-5xl xl:text-7xl text-left mb-4 text-purple-12 dark:text-purpledark-12'>
						Transforme sua vida com a prática do Yoga, onde quer que esteja.
					</h1>
					<h2 className='text-xl xs:text-2xl md:text-3xl lg:text-4xl text-purple-11 dark:text-purpledark-11'>
						Bem-vindo ao Yoga em Movimento.
					</h2>
				</div>
				<div>
					<Image
						className='hidden sm:block'
						src={buildImgSource('0bccd83e-9399-4753-5093-468094deed00')}
						cdn='cloudflare_images'
						layout='constrained'
						width={400}
						height={400}
						alt='Mulher praticando Yoga'
					/>
				</div>
			</section>
			<Testimonies/>
			<History/>
		</main>
	);
}
