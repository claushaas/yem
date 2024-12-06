type FormationContentCardProperties = {
	readonly title: string;
	readonly description: string;
};

export function FormationContentCard({title, description}: FormationContentCardProperties) {
	return (
		<div className='px-6 py-4 rounded-3xl shadow-sm shadow-mauve-11 dark:shadow-mauvedark-3 bg-mauve-6 dark:bg-mauvedark-6 flex flex-col justify-evenly'>
			<h3 className='text-purple-12 dark:text-purpledark-12 my-0'>{title}</h3>
			<p>{description}</p>
		</div>
	);
}
