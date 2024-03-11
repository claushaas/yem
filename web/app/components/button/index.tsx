import React from 'react';

type ButtonProps = {
	text?: string;
	disabled?: boolean;
};

const baseButtonClasses = `
	px-4
	py-1
	rounded-lg
	shadow-lg
	transition-colors
	duration-200
	ease-in-out
	focus:outline-none
	focus:ring-2
	focus:ring-opacity-50
	disabled:bg-gray-5
	disabled:dark:bg-graydark-5
	disabled:cursor-not-allowed
	disabled:hover:bg-gray-5
	disabled:hover:dark:bg-graydark-5
	disabled:active:bg-gray-5
	disabled:active:dark:bg-graydark-5
	disabled:text-gray-7
	disabled:dark:text-graydark-7
	disabled:shadow-none
`;

export const PrimaryButton = ({text = 'Clicar Aqui', disabled = false}: ButtonProps) => (
	<>
		<button className='shadow-purple-12'>Teste</button>
		<button
			className={baseButtonClasses + `
				bg-purple-9
				dark:bg-purpledark-9
				text-whitea-11
				hover:bg-purple-10
				hover:dark:bg-purpledark-10
				active:bg-purple-12
				active:dark:bg-purpledark-12
				focus:ring-purple-9
				shadow-purple-12
			`}
			disabled={disabled}
		>
			{text}
		</button>
	</>
);

export const SecondaryButton = ({text = 'Clicar Aqui', disabled = false}: ButtonProps) => (
	<button
		className={baseButtonClasses + `
			bg-purple-3
			dark:bg-purpledark-3
			text-blacka-7
			dark:text-whitea-7
			hover:bg-purple-4
			hover:dark:bg-purpledark-4
			active:bg-purple-5
			active:dark:bg-purpledark-5
			focus:ring-purple-3
		`}
		disabled={disabled}
	>
		{text}
	</button>
);
