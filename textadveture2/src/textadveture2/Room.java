package textadveture2;
import java.util.ArrayList;

public class Room {
	private String name;
	private String desc;
	private String shortcut;
	private Inventory inv;
	
	public Room(String name, String desc, String shortcut) {
		this.name = name;
		this.desc = desc;
		this.shortcut = shortcut;
		this.inv = new Inventory(name + " Inv");
	}

	public String getShortcut() {
		return this.shortcut;
	}

	public void addItem(ArrayList<Item> items)
	{
		this.inv.addItem(items);
	}

	public void addItem(Item i) {
		this.inv.addItem(i);
	}

	public void pickupItems(Inventory pInv) {
		pInv.addItem(this.inv.removeAllItems());
	}

	public String getName() {
		return name;
	}

	public String getDesc() {
		return this.desc;
	}

	boolean isZone() {
		return false;
	}

	public void printRooms() {
		return;
	}

    public void searchRoom() {
		// if no items
		if (inv.getInv().isEmpty())
			System.out.println("You found nothing.");
		else for (Item item : inv.getInv())
			System.out.println("You found: " + item.getName());
    }
}
