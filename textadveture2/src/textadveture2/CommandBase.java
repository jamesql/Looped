package textadveture2;

public interface CommandBase {    
    public abstract void execute();
    public abstract void undo();
    public abstract boolean canUndo();
}
