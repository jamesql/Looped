
// change any to real type todo:
interface serverIconProps {
    id: string,
    name: string,
    icon: string | null,
    active: boolean,
    setActiveServer: (id: string) => void
}

export const ServerIcon:React.FC<serverIconProps> = (props: serverIconProps) => {
    return (
        <div>
            <button onClick={() => props.setActiveServer(props.id)}>
                <img src={props.icon?props.icon:"/meta_logo.png"} alt="" />
            </button>
        </div>
    );
}