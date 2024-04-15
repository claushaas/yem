import {type ReactNode, createContext, useContext} from 'react';

type Properties = {readonly isBot: boolean; readonly children: ReactNode};

const context = createContext(false);

export function useIsBot() {
	return useContext(context) ?? false;
}

export function IsBotProvider({isBot, children}: Properties) {
	return <context.Provider value={isBot}>{children}</context.Provider>;
}
