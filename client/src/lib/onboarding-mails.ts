import { BaseMail } from '@/models/mail';
import { Timestamp } from 'firebase/firestore';

export const generateOnboardingMails = (): BaseMail[] => {
	const now = Timestamp.now();

	return [
		{
			id: 'welcome_1',
			type: 'game_message',
			category: 'messages',
			created_at: now,
			sender_name: 'Supreme Council',
			title: 'Commander Assignment Protocol',
			content: `Greetings, Commander.

On behalf of the Galactic Council, I extend my congratulations on your graduation from the Elite Commander Academy. Your exceptional performance has not gone unnoticed.

As per protocol, you are now required to select your first command post. Choose your homeworld wisely, as it will serve as the foundation for your future operations and contributions to our galactic civilization.

The Council awaits your decision.

[CLICK TO CHOOSE YOUR HOMEWORLD]`,
			read: false,
			archived: false,
			data: {
				action: 'choose_homeworld',
				priority: 'high',
			},
			ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
		},
		{
			id: 'welcome_2',
			type: 'private_message',
			category: 'messages',
			created_at: Timestamp.fromMillis(now.toMillis() - 1000),
			sender_name: 'Mom',
			title: 'Important Reminders for My Space Commander!',
			content: `Sweetie! 💖

I know you're about to command your very own planet, but don't forget:

- Pack your warm space socks - space is cold!
- Remember to brush your teeth after each meal (even freeze-dried ones)
- Call me at least twice per galactic cycle
- Don't talk to strange aliens unless they've been properly introduced
- Keep your ray gun charged and your quarters tidy

I put some homemade cosmic cookies in your cargo bay. Share them with your crew! 🍪

PS: Your father says to remember the trick about reversing the polarity - whatever that means! 🤷‍♀️

Lots of love and virtual hugs! 🤗
Mom`,
			read: false,
			archived: false,
			data: {},
			ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
		},
		{
			id: 'welcome_3',
			type: 'private_message',
			category: 'messages',
			created_at: Timestamp.fromMillis(now.toMillis() - 2000),
			sender_name: 'Jake from the Academy',
			title: 'You Actually Made It!',
			content: `Hey Commander Hotshot! 🚀

Can't believe they actually let YOU graduate! Remember when you accidentally activated the emergency evacuation system during naptime in Stellar Navigation 101? The look on Professor Zorblax's face when his hover-chair shot him straight into the ceiling... PRICELESS! 😂

Or that time you tried to impress Sarah from Quantum Physics by "improving" the cafeteria's food replicator, and it spent a week producing nothing but purple spaghetti that tasted like rubber bands? Good times!

But seriously, despite all our shenanigans (like that infamous incident with the training simulator and the space hamster - which was totally YOUR fault, by the way), you've actually become a pretty decent commander. Who would've thought?

Congrats on the promotion, you magnificent disaster! Try not to blow up your homeworld on the first day, okay? 

P.S. I still have that embarrassing hologram from the graduation party. You know, the one where you tried to demonstrate your "perfect" impression of an Andromedan space whale mating call? That's prime blackmail material right there! 😈

Your partner in crime,
Jake

P.P.S. But really, proud of you buddy! 🎉`,
			read: false,
			archived: false,
			data: {
				friendship_level: 'best_buddies',
				blackmail_material: 'abundant',
			},
			ttl: Timestamp.fromMillis(1000 * 60 * 60 * 24 * 30),
		},
	];
};
