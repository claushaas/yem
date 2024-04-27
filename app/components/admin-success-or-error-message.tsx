export function SuccessOrErrorMessage({success, error}: {readonly success?: string; readonly error?: string}) {
	return (success ?? error) && (
		<p className='mb-4 text-lg'>
			{success ?? error}
		</p>
	);
}
