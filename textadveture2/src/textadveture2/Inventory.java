package textadveture2;

import java.util.ArrayList;

// Singleton
public class Inventory {
	private ArrayList<Item> inv = new ArrayList<Item>();
	private String name;
	
	public Inventory(String n) {
		this.setName(n);	
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ArrayList<Item> getInv() {
		return this.inv;
	}

	public void displayItems() {
		if (inv.isEmpty()) {
			System.out.println("Your inventory is empty.");
		} else {
			System.out.println("Items in your inventory:");
			for (Item item : inv) { // Assuming `Item` has a `getName()` method
				System.out.println("- " + item.getName());
			}
		}
	}

	public void setInv(ArrayList<Item> inv) {
		this.inv = inv;
	}
	
	public void addItem(Item i) {
		this.inv.add(i);
	}
	
	public void addItem(ArrayList<Item> i) {
		this.inv.addAll(i);
	}
	
	public boolean removeItem(Item i) {
		return this.inv.remove(i);
	}
	
	public ArrayList<Item> removeAllItems() {
		ArrayList<Item> c = (ArrayList<Item>) this.inv.clone();
		this.inv.clear();
		return c;
	}
	 
	public boolean containsItem(Item key) {
		for (Item item : inv) {
			if (item.getName().equals(key.getName())) {
				return true;
			}
		}
		return false;
	}
	
}
