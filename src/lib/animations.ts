import { Variants } from 'framer-motion';

export const pageVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			when: 'beforeChildren',
			staggerChildren: 0.1,
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: {
			duration: 0.3,
		},
	},
};

export const containerVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	show: {
		opacity: 100,
		y: 0,
		transition: {
			duration: 0.5,
			staggerChildren: 0.1,
			when: 'beforeChildren',
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: {
			duration: 0.3,
		},
	},
};

export const itemVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
		},
	},
};

export const cardVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
		},
	},
	hover: {
		scale: 1.02,
		transition: {
			duration: 0.2,
		},
	},
	tap: {
		scale: 0.98,
	},
};

export const fadeInVariants: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideInVariants: Variants = {
	hidden: { opacity: 0, x: -20 },
	show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};
