/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
const lrMessages: Record<string, string> = {
	'12': 'Verifique os dados do cartão',
	'06': 'Verifique os dados do cartão',
	'A2': 'Verifique os dados do cartão',
	'51': 'Saldo/limite insuficiente',
	'A5': 'Saldo/limite insuficiente',
	'54': 'Verifique os dados do cartão',
};

export const getLrMessage = (lrCode: string): string => lrMessages[lrCode] ?? 'Erro no processamento do pagamento';
