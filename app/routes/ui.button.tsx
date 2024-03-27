import {Button, ButtonPreset} from '~/components/button/index.js';

export default function ButtonUi() {
	return (
		<>
			<h1>Buttons</h1>
			<h2>Primary Button</h2>
			<Button preset={ButtonPreset.Primary}/>
			<h2>Disabled Button</h2>
			<Button isDisabled/>
			<h2>Secondary Button</h2>
			<Button preset={ButtonPreset.Secondary}/>
		</>
	);
}
