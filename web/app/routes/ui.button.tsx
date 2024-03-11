import React from 'react';
import {PrimaryButton, SecondaryButton} from '~/components/button';

export default function ButtonUi() {
	return (
		<div>
			<h1>Buttons</h1>
			<h2>Primary Button</h2>
			<PrimaryButton />
			<h2>Disabled Button</h2>
			<PrimaryButton disabled />
			<h2>Secondary Button</h2>
			<SecondaryButton />
		</div>
	);
}
