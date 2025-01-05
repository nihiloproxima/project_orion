import { BaseMail } from "@/models/mail";

export const generateOnboardingMails = (ownerId: string): BaseMail[] => {
  const now = Date.now();

  return [
    {
      id: "welcome_1",
      type: "game_message",
      category: "messages",
      created_at: now,
      owner_id: ownerId,
      sender_name: "Supreme Council",
      title: "Commander Assignment Protocol",
      content: `Greetings, Commander.

On behalf of the Galactic Council, I extend my congratulations on your graduation from the Elite Commander Academy. Your exceptional performance has not gone unnoticed.

As per protocol, you are now required to select your first command post. Choose your homeworld wisely, as it will serve as the foundation for your future operations and contributions to our galactic civilization.

The Council awaits your decision.

[CLICK TO CHOOSE YOUR HOMEWORLD]`,
      read: false,
      archived: false,
      data: {
        action: "choose_homeworld",
        priority: "high",
      },
    },
    {
      id: "welcome_2",
      type: "private_message",
      category: "messages",
      created_at: now - 1000,
      owner_id: ownerId,
      sender_name: "Mom",
      title: "Important Reminders for My Space Commander!",
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
    },
    {
      id: "welcome_3",
      type: "ai_message",
      category: "messages",
      created_at: now - 2000,
      owner_id: ownerId,
      sender_name: "AI Assistant",
      title: "Welcome to Star Command",
      content: `Greetings Commander,

I am your AI assistant, ready to help you navigate your new responsibilities. Here's what you need to know:

1. First, check the message from the Supreme Council to choose your homeworld
2. Once established, I'll guide you through building your first structures
3. Keep an eye on your secure communications terminal for important updates

Need assistance? Just ask!

Your loyal AI Assistant`,
      read: false,
      archived: false,
      data: {
        ai_confidence: 1,
        priority_level: "high",
      },
    },
  ];
};
