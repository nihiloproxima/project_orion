import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation(namespace: string) {
	const { t, locale, setLocale } = useLanguage();

	return {
		t: (key: string, params?: Record<string, string>) => t(namespace, key, params),
		locale,
		setLocale,
	};
}
