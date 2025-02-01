
// change any to real type todo:
interface serverSelectorProps {
    serverData: any,
    selectedServerData: any,
    selectedServer: string,
    setActiveServer: (id: string) => void
}

export const ServerSelector: React.FC<serverSelectorProps> = (props: serverSelectorProps) => {
    return (<h1>test</h1>);
}