export const convertStringToStartCase = (string: string): string => {
	const words = string.split(' ');
	const startCaseWords = words.map(word => {
		const firstLetter = word.charAt(0).toUpperCase();
		const restOfWord = word.slice(1).toLowerCase();
		return `${firstLetter}${restOfWord}`;
	});
	return startCaseWords.join(' ');
};
