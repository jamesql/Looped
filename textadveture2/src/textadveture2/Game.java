package textadveture2;

import java.util.Scanner;

// Singleton
public class Game {
	private Inventory inv;
	private Room currentRoom;
	private static Game instance;
	private Scanner scanner;
	private Key key;
	private Room endRoom;

	public void setCurrentRoom(Room room) {
		this.currentRoom = room;
	}

	private Game() {
		this.scanner = new Scanner(System.in);
		this.inv = new Inventory("Player Inv");
		Zone enchantedForest = new Zone("Enchanted Forest", "A mystical forest filled with magical creatures.", "ef");
		Room fairyGlen = new Room("Fairy Glen", "A serene glen where fairies dance under the moonlight.", "fg");
		Room ancientOak = new Room("Ancient Oak", "A massive oak tree that is said to be as old as time itself.", "ao");
		
		enchantedForest.add(fairyGlen);
		enchantedForest.add(ancientOak);

		Zone crystalCave = new Zone("Crystal Cave", "A cave glittering with crystals of all colors.", "cc");
		Room shimmeringGrotto = new Room("Shimmering Grotto", "A hidden grotto where the walls sparkle with crystals.", "sg");
		Room echoingChamber = new Room("Echoing Chamber", "A chamber where every sound is amplified and echoed.", "ec");

		crystalCave.add(shimmeringGrotto);
		crystalCave.add(echoingChamber);

		Zone mysticRiver = new Zone("Mystic River", "A river that flows with water that glows in the dark.", "mr");
		Room moonlitBank = new Room("Moonlit Bank", "A riverbank that is always bathed in moonlight.", "mb");
		Room whisperingFalls = new Room("Whispering Falls", "A waterfall that whispers secrets to those who listen.", "wf");

		mysticRiver.add(moonlitBank);
		mysticRiver.add(whisperingFalls);

		Zone startingPoint = new Zone("Starting Point", "The beginning of your adventure.", "sp");
		startingPoint.add(enchantedForest);
		startingPoint.add(crystalCave);
		startingPoint.add(mysticRiver);

		// add a couple random items aswell as the key
		Item coin = new Coin("Echoing Chamber", "Coin");
		Item sword = new Sword("Ancient Oak", "Sword");
		Item potion = new Potion("Shimmering Grotto", "Potion");
		this.key = new Key("Moonlit Bank");

		ancientOak.addItem(sword);
		shimmeringGrotto.addItem(potion);
		echoingChamber.addItem(coin);
		moonlitBank.addItem(this.key);

		this.currentRoom = startingPoint;
		this.endRoom = whisperingFalls;
	}

	private void printCommands()
	{
		System.out.println("Available Commands: ");
		System.out.println("move <shortcut or name>");
		System.out.println("pickup");
		System.out.println("search");
		System.out.println("Check Inventory (check)");
		System.out.println("back");

		// if user has key, add unlock command
		if (this.inv.containsItem(this.key)) {
			System.out.println("unlock");
		}
	}

	private void commandParser(Scanner scanner)
	{
		String command = scanner.nextLine();
		String[] commandParts = command.split(" ");
		switch(commandParts[0])
		{
			case "move":
				if(currentRoom.isZone())
				{
					Room newRoom = ((Zone)currentRoom).getRoom(commandParts[1]);
					if(newRoom != null)
					{
						CommandInvoker.getInstance().executeCommand(new MoveCommand(this.currentRoom, newRoom));
					}
					else
					{
						System.out.println("Invalid room name or shortcut.");
					}
				}
				else
				{
					System.out.println("You can't move from here.");
				}
				break;
			case "pickup":
				if(currentRoom.isZone())
				{
					System.out.println("You can't pickup items in a zone.");
				}
				else
				{
					currentRoom.pickupItems(inv);
				}
				break;
			case "search":
				if(currentRoom.isZone())
				{
					System.out.println("You can't search in a zone.");
				}
				else
				{
					currentRoom.searchRoom();
				}
				break;
			case "check":
				this.inv.displayItems();
				break;
			case "back":
				CommandInvoker.getInstance().undo();
				break;
			case "unlock":
				if (this.inv.containsItem(this.key) && currentRoom.getName().equals(this.endRoom.getName())) {
					System.out.println("You have unlocked the secret of the " + this.endRoom.getName() + ".");
					System.out.println("Congratulations! You have completed the game.");
					System.exit(0);
				} else {
					System.out.println("You can't unlock anything here.");
				}
				break;
			default:
				System.out.println("Invalid command.");
		}
	}

	public void playRound()
	{
		while(true)
		{
			System.out.println("You are in " + this.currentRoom.getName() + ".");
			System.out.println("Description: " + this.currentRoom.getDesc());
			if(currentRoom.isZone())
			{
				System.out.println("Available Places: ");
				currentRoom.printRooms();
			}
			printCommands();
			commandParser(this.scanner);
		}
	}
	public static Game getInstance() {
		if (instance == null) {
			instance = new Game();
		}
		return instance;
	}

	//A gatter from Room
	public Room getCurrentRoom()
	{
		return this.currentRoom;
	}

	//A gatter for inventory
	public Inventory getInventory()
	{
		return this.inv;
	}

}
