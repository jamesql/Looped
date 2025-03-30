import classes from "../styles/serverdiscoverymodal.module.css";
import { Server } from "../../../Types/serverTypes";
import { getCdnFileUrl } from "@/util/functions";
import { useEffect, useState, useRef } from "react";
import ApiClient from "@/util/api";
import Cookie from "js-cookie";
import { MdClose } from "react-icons/md";

interface ServerDiscoveryModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server;
}

const ServerDiscoveryModal: React.FC<ServerDiscoveryModalProps> = ({
    isOpen,
    setClose,
    server,
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleOutsideClick = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setClose(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    const [bannerUrl, setBannerUrl] = useState<string>("/logo_main.jpg");
    const [iconUrl, setIconUrl] = useState<string>("/logo_main.jpg");

    useEffect(() => {
        if (server.banner)
            getCdnFileUrl(server.banner).then((url) => {
                setBannerUrl(url);
            });
    }, [server.banner]);

    useEffect(() => {
        if (server.icon)
            getCdnFileUrl(server.icon).then((url) => {
                setIconUrl(url);
            });
    }, [server.icon]);

    const handleJoinServer = async () => {
        ApiClient.getInstance()
            .joinServerPublic(server.id, Cookie.get("access_token") || "")
            .then(() => {
                setClose(false);
            });
    };

    if (!isOpen) return null;

    return (
        <div className={classes.server_discovery_modal}>
            <div className={classes.server_discovery_modal_content} ref={modalRef}>
                <div className={classes.banner_container}>
                    <img src={bannerUrl} className={classes.banner_img} />
                    <button className={classes.close_button} onClick={() => setClose(false)}>
                        <MdClose/>
                    </button>
                </div>

                <div className={classes.server_info}>
                    <div className={classes.info_first_row}>
                        <div className={classes.server_main_info_container}>
                            <img src={iconUrl} className={classes.icon} />
                            <div>
                                <h3>{server.name}</h3>
                                <a href={server.website}>{server.website}</a>
                            </div>
                        </div>
                        <button className={classes.join_server} onClick={handleJoinServer}>
                            Join Server
                        </button>
                    </div>
                    {server.description}
                    <h4>Open Jobs</h4>
                </div>
            </div>
        </div>
    );
};

export default ServerDiscoveryModal;
