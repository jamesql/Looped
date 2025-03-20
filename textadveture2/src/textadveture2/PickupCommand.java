package textadveture2;

public class PickupCommand implements CommandBase{
    private Room room; 
    private Inventory playerInventory;

    public PickupCommand (Room room, Inventory playerInventory)
    {
        this.room = room;
        this.playerInventory = playerInventory;
    }

    // pick item in the room and added to the player inventory 
    @Override
    public void execute ()
    {
        room.pickupItems(playerInventory);
        System.out.println("Item picked from room " + room.getName());  
    }

    @Override
    public boolean canUndo() {
        return false;
    }

    @Override
    public void undo() {
        throw new UnsupportedOperationException("Unimplemented method 'undo'");
    };
}