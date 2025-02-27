'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
	const { locale, setLocale, t } = useLanguage();

	return (
		<div className="flex items-center gap-2">
			<Globe className="h-4 w-4 text-primary" />
			<Select value={locale} onValueChange={(value) => setLocale(value as 'en' | 'fr')}>
				<SelectTrigger className="w-[180px] bg-black border-primary/30 text-primary hover:border-primary/60 transition-colors">
					<SelectValue placeholder={t('common', 'language.select')} />
				</SelectTrigger>
				<SelectContent className="bg-black/95 border-primary/30">
					<SelectItem value="en" className="text-blue-400 hover:bg-blue-500/20">
						{`> English`}
					</SelectItem>
					<SelectItem value="fr" className="text-blue-400 hover:bg-blue-500/20">
						{`> Français`}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
