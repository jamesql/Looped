package textadveture2;
import java.util.Stack;

public class CommandInvoker {
    private static CommandInvoker instance;
    private final Stack<CommandBase> history = new Stack<>(); // only contains undoable commands (MoveCommand)

    private CommandInvoker() { }

    public static CommandInvoker getInstance() {
        if (instance == null) {
            instance = new CommandInvoker();
        }
        return instance;
    }

    public void executeCommand(CommandBase command) {
        command.execute();
        if(command.canUndo())
            history.push(command);
    }

    public void undo() {
        if (!history.isEmpty()) {
            history.pop().undo();
        }
    }
}

