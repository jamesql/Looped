import React, { useEffect, useState } from 'react';
import { Server } from '../../../Types/serverTypes';
import discoveryClasses from "../styles/serverdiscovery.module.css"
import { getCdnFileUrl } from '@/util/functions';
import ServerDiscoveryModal from './ServerDiscoveryModal';

interface ServerCardProps {
    server: Server;
    key: number;
}

const ServerCard: React.FC<ServerCardProps> = ({ server }) => {
    const [bannerUrl, setBannerUrl] = useState<string>("/logo_main.jpg");
    const [iconUrl, setIconUrl] = useState<string>("/logo_main.jpg");
    const [modalActive, setModalActive] = useState<boolean>(false);

    useEffect(() => {
      if(server.banner)
        getCdnFileUrl(server.banner).then(url => {
          setBannerUrl(url);
        });
    }, [server.banner]);

    useEffect(() => {
        if(server.icon)
          getCdnFileUrl(server.icon).then(url => {
            setIconUrl(url);
          });
      }, [server.icon]);
    
      return (
        <>
        <div className={discoveryClasses.server_card} onClick={(e) => setModalActive(true)}>
          <img src={bannerUrl} className={discoveryClasses.server_card_banner_img} />
          <div className={discoveryClasses.server_card_icon_container}>
            <img src={iconUrl} className={discoveryClasses.server_card_icon} />
          </div>
          <div className={discoveryClasses.server_card_info}>
            <h3>{server.name}</h3>
            <p>{server.description}</p>
          </div>
        </div>
        {modalActive && <ServerDiscoveryModal isOpen={modalActive} setClose={setModalActive} server={server} />}
        </>
      );
};

export default ServerCard;