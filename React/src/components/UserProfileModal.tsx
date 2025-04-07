import React, { useEffect, useState } from "react";
import { User } from "../../../Types/userTypes";
import modalClasses from "../styles/userprofilemodal.module.css";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import { MdClose, MdMessage, MdPersonAdd } from "react-icons/md";

interface UserProfileModalProps {
    user: User | null;
    x: number;
    y: number;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, x, y }) => {
    const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
    useEffect(() => {
        if (user?.avatar) {
            getCdnFileUrl(user?.avatar).then((url) => {
                setAvatarUrl(url);
            });
        } else {
            setAvatarUrl("/logo_main.jpg");
        }
    }, [user?.avatar]);

    const [portfolioUrls, setportfolioUrls] = useState<string[]>([
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
    ]);

    useEffect(() => {
        const updatePortfolioUrls = async () => {
            try {
                if (user?.portfolioCdnImages) {
                    const urls = await Promise.all(
                        user?.portfolioCdnImages.map((item) =>
                            item ? getCdnFileUrl(item) : "/logo_main.jpg"
                        )
                    );
                    setportfolioUrls(urls);
                }
            } catch (error) {
                console.error("Error fetching portfolio image URLs:", error);
            }
        };

        updatePortfolioUrls();
    }, [user?.portfolioCdnImages]);

    const skills = user?.skills || [];
    return (
        <>
            <div
                className={modalClasses.user_profile_card}
                style={{ top: y, left: x }}
            >
                <div className={modalClasses.user_main_info}>
                    <img className={classes.squircle} src={avatarUrl} alt="" />
                    <div className={modalClasses.user_sub_info}>
                        <h4>
                            {user?.firstName} {user?.lastName}
                        </h4>
                        <h5>{user?.status}</h5>
                    </div>
                </div>

                <div className={modalClasses.action_button_row}>
                    <button className={modalClasses.icon_button}>
                        <MdPersonAdd className={modalClasses.icon} />
                    </button>
                    <button className={modalClasses.icon_button}>
                        <MdMessage className={modalClasses.icon} />
                    </button>
                    <button className={modalClasses.icon_button}>
                        <MdClose className={modalClasses.icon} />
                    </button>
                </div>
                {portfolioUrls.length !== 0 && (
                    <>
                        <h4>Portfolio</h4>
                        <div className={modalClasses.portfolio_grid}>
                            {portfolioUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt="Portfolio Image"
                                    className={modalClasses.portfolio_image}
                                />
                            ))}
                        </div>
                    </>
                )}
                {skills.length !== 0 && (
                    <>
                        <h4>Skills</h4>
                        <div className={modalClasses.skills_grid}>
                            {skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className={modalClasses.skill_tag}
                                >
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default UserProfileModal;
