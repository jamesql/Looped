package textadveture2;

public class Key implements Item {
	private String room;
	private String name;
	
	public Key(String room) {
		this.room = room;
		this.name = "Key";
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
