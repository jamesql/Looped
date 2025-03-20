package textadveture2;

import java.util.ArrayList;
import java.util.HashMap;

public class Zone extends Room {
	private HashMap<String, Room> roomsMap = new HashMap<>();
	private ArrayList<Room> roomsArray = new ArrayList<>();

	public Zone(String name, String desc, String shortcut) {
		super(name, desc, shortcut); // Call to the superclass constructor
	}

	public void add(Room r) {
		this.roomsArray.add(r);
		this.roomsMap.put(r.getName(), r);
		this.roomsMap.put(r.getShortcut(), r);
	}

	public boolean remove(Room r) {
		this.roomsMap.remove(r.getShortcut());
		this.roomsMap.remove(r.getName());
		
		return this.roomsArray.remove(r);
	}

	public ArrayList<Room> getRooms() {
		return this.roomsArray;
	}

	Room getRoom (String shortcut) {
		return this.roomsMap.get(shortcut);
	}

	@Override
	boolean isZone() {
		return true;
	}

	@Override
	public void printRooms() {
		for(Room r : roomsArray) {
			System.out.println(r.getName() + " - " + r.getShortcut());
		}
	}

}
