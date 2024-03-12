import React from 'react';
import {Button, ButtonPreset} from '~/components/button';

const ButtonUi = () => (
	<>
		<h1>Buttons</h1>
		<h2>Primary Button</h2>
		<Button preset={ButtonPreset.Primary}/>
		<h2>Disabled Button</h2>
		<Button disabled />
		<h2>Secondary Button</h2>
		<Button preset={ButtonPreset.Secondary}/>
	</>
);

export default ButtonUi;
