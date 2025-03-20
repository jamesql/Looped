package textadveture2;

public class MoveCommand implements CommandBase {
    private Room currentRoom;
    private Room nextRoom;

    public MoveCommand(Room currentRoom, Room nextRoom) {
        this.currentRoom = currentRoom;
        this.nextRoom = nextRoom;
    }

    @Override
    public void execute() {
        Game.getInstance().setCurrentRoom(this.nextRoom);
    }

    @Override
    public void undo() {
        Game.getInstance().setCurrentRoom(this.currentRoom);
    }

    @Override
    public boolean canUndo() {
        return true;
    };
}
