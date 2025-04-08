'use client';

import React, { createContext, useContext, useState } from 'react';
import { Locale, resources, defaultLocale } from '../locales';

type LanguageContextType = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (namespace: string, key: string, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
	locale: defaultLocale,
	setLocale: () => {},
	t: () => '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(() => {
		if (typeof window !== 'undefined') {
			const savedLocale = localStorage.getItem('app-locale');
			return (savedLocale as Locale) || defaultLocale;
		}
		return defaultLocale;
	});

	// Update locale when user changes it
	const setLocale = async (newLocale: Locale) => {
		setLocaleState(newLocale);
		localStorage.setItem('app-locale', newLocale);
	};

	// Translation function
	const t = (namespace: string, key: string, params?: Record<string, string>): string => {
		// Split the key by dots to navigate nested objects
		const keys = key.split('.');

		// Get the resource object for the current locale and namespace
		const resource = resources[locale]?.[namespace as keyof (typeof resources)[typeof locale]];

		if (!resource) {
			console.warn(`Namespace "${namespace}" not found for locale "${locale}"`);
			return key;
		}

		// Navigate through the nested objects to find the translation
		let translation = keys.reduce((obj: any, k) => obj?.[k], resource);

		// If translation not found, try the default locale
		if (!translation && locale !== defaultLocale) {
			const defaultResource =
				resources[defaultLocale]?.[namespace as keyof (typeof resources)[typeof defaultLocale]];
			translation = keys.reduce((obj: any, k) => obj?.[k], defaultResource);
		}

		// If still no translation, return the key
		if (!translation) {
			console.warn(`Translation key "${key}" not found in namespace "${namespace}"`);
			return key;
		}

		// Replace parameters in the translation
		if (params) {
			return Object.entries(params).reduce(
				(str, [param, value]) => str.replace(new RegExp(`{{${param}}}`, 'g'), value),
				translation
			);
		}

		return translation;
	};

	return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
