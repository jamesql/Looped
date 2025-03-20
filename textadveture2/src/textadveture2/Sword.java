package textadveture2;

public class Sword implements Item {
	private String room;
	private String name;
	
	public Sword(String room, String name) {
		this.room = room;
		this.name = name;
	}

	@Override
	public String getRoom() {
		return this.room;
	}

	@Override
	public String getName() {
		return this.name;
	}

}
