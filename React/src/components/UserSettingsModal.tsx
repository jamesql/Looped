import React, { useEffect, useState } from "react";
import { z } from "zod";
import classes from "../styles/usersettingsmodal.module.css";
import { User } from "../../../Types/userTypes";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
import { getCdnFileUrl, uploadCdnFile } from "@/util/functions";
import { MdClose, MdCloudUpload } from "react-icons/md";
import FileDropper from "./FileDropper";
import { R2File } from "../../../Types/contentTypes";

const userSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required.")
        .max(50, "First name cannot exceed 50 characters."),
    lastName: z
        .string()
        .min(1, "Last name is required.")
        .max(50, "Last name cannot exceed 50 characters."),
    location: z
        .string()
        .min(1, "Location is required.")
        .max(100, "Location cannot exceed 100 characters."),
    status: z
        .string()
        .min(1, "Status is required.")
        .max(200, "Status cannot exceed 200 characters."),
});

interface UserSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    user: User | undefined;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
    isOpen,
    setClose,
    user,
}) => {
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [location, setLocation] = useState(user?.location || "");
    const [status, setStatus] = useState(user?.status || "");
    const [avatarFile, setAvatarFile] = useState(user?.avatar || null);

    const [portfolioCdnImages, setPortfolioCdnImages] = useState<R2File[]>(
        user?.portfolioCdnImages || []
    );

    const [portfolioCount, setPortfolioCount] = useState(
        Math.min(portfolioCdnImages.length, 4)
    );
    const addPortfolioFile = (item: R2File) => {
        setPortfolioCdnImages([...portfolioCdnImages, item]);
    };

    const setPortfolioFile = (index: number, item: R2File) => {
        const newPortfolioCdnImages = [...portfolioCdnImages];
        newPortfolioCdnImages[index] = item;
        setPortfolioCdnImages(newPortfolioCdnImages);
    };

    const [skills, setSkills] = useState(user?.skills || []);
    const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
    const [imgHover, setImgHover] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [portfolioUrls, setportfolioUrls] = useState<string[]>([
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
    ]);
    useEffect(() => {
        if (avatarFile) {
            getCdnFileUrl(avatarFile).then((url) => {
                setAvatarUrl(url);
            });
        } else {
            setAvatarUrl("/logo_main.jpg");
        }
    }, [avatarFile]);

    useEffect(() => {
        const updatePortfolioUrls = async () => {
            try {
                const urls = await Promise.all(
                    portfolioCdnImages.map((item) =>
                        item ? getCdnFileUrl(item) : "/logo_main.jpg"
                    )
                );
                setportfolioUrls(urls);
            } catch (error) {
                console.error("Error fetching portfolio image URLs:", error);
            }
        };

        updatePortfolioUrls();
    }, [portfolioCdnImages]);

    if (!user) return null;

    const validateForm = () => {
        const formData = { firstName, lastName, location, status };
        try {
            userSchema.parse(formData);
            return {};
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                return newErrors;
            }
            return {};
        }
    };

    const userAvatarFileChangeNew = async (files: FileList) => {
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setAvatarFile(cdnResp.r2file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({}); // Clear errors if validation passes

        // get token
        const token = Cookies.get("access_token");

        if (!token) {
            alert("You must be logged in to edit your profile.");
            return;
        }

        await ApiClient.getInstance().editUser(
            firstName,
            lastName,
            location,
            status,
            token,
            skills,
            portfolioCdnImages.map((file) => file.id),
            avatarFile?.id
        );
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <div className={classes.modal_header}>
                    <h2>User Settings</h2>
                    <div className={classes.close}>
                        <MdClose onClick={() => setClose(false)}></MdClose>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={classes.label}>
                        <label>
                            First Name:
                            <input
                                type="text"
                                name="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </label>
                        {errors.firstName && (
                            <span className={classes.error}>
                                {errors.firstName}
                            </span>
                        )}
                    </div>
                    <div className={classes.label}>
                        <label>
                            Last Name:
                            <input
                                type="text"
                                name="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </label>
                        {errors.lastName && (
                            <span className={classes.error}>
                                {errors.lastName}
                            </span>
                        )}
                    </div>
                    <div className={classes.label}>
                        <label>
                            Location:
                            <input
                                type="text"
                                name="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </label>
                        {errors.location && (
                            <span className={classes.error}>
                                {errors.location}
                            </span>
                        )}
                    </div>
                    <div className={classes.label}>
                        <label>
                            Status:
                            <input
                                type="text"
                                name="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            />
                        </label>
                        {errors.status && (
                            <span className={classes.error}>
                                {errors.status}
                            </span>
                        )}
                    </div>
                    <label>
                        Skills:
                        <div>
                            <div className={classes.skills}>
                                {skills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className={classes.skill_tag}
                                        onClick={() =>
                                            setSkills(
                                                skills.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                    >
                                        {skill}
                                        <MdClose />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className={classes.skill_input_bar}>
                                    <input
                                        type="text"
                                        placeholder="Enter a skill"
                                        id="newSkillInput"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input =
                                                    e.target as HTMLInputElement;
                                                if (
                                                    input &&
                                                    input.value.trim()
                                                ) {
                                                    setSkills([
                                                        ...skills,
                                                        input.value.trim(),
                                                    ]);
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                        className={classes.skill_input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input =
                                                document.getElementById(
                                                    "newSkillInput"
                                                ) as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                setSkills([
                                                    ...skills,
                                                    input.value.trim(),
                                                ]);
                                                input.value = "";
                                            }
                                        }}
                                        className={[
                                            classes.button,
                                            classes.skill_input_bar_button,
                                        ].join(" ")}
                                    >
                                        Add Skill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </label>
                    Avatar:
                    <div className={classes.user_avatar_container}>
                        <FileDropper
                            onFilesDropped={userAvatarFileChangeNew}
                            accept=".png,.jpg,.jpeg,.gif"
                        >
                            <div
                                className={classes.user_avatar}
                                onMouseEnter={() => setImgHover(true)}
                                onMouseLeave={() => setImgHover(false)}
                            >
                                <img
                                    src={avatarUrl}
                                    alt="User Avatar"
                                    className={classes.user_avatar_img}
                                />
                                {imgHover && (
                                    <div className={classes.overlay_icon}>
                                        <MdCloudUpload
                                            size={24}
                                            onClick={() => setAvatarFile(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        </FileDropper>
                    </div>
                    Portfolio Images:
                    <div className={classes.image_grid_container}>
                        {portfolioUrls
                            .slice(0, portfolioCount)
                            .map((url, index) => (
                                <div
                                    key={index}
                                    className={classes.user_portfolio_element}
                                >
                                    <img
                                        src={url}
                                        alt="Portfolio Image"
                                        className={classes.user_portfolio_image}
                                    />
                                    <div className={classes.hover_overlay}>
                                        <FileDropper
                                            onFilesDropped={async (files) => {
                                                if (files && files.length > 0) {
                                                    const file = files[0];
                                                    const cdnResp =
                                                        await uploadCdnFile(
                                                            file
                                                        );
                                                    setPortfolioFile(
                                                        index,
                                                        cdnResp.r2file
                                                    );
                                                }
                                            }}
                                            accept=".png,.jpg,.jpeg,.gif"
                                        >
                                            <button
                                                className={classes.hover_button}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                } // Prevent modal from closing
                                                type="button"
                                            >
                                                <MdCloudUpload size={20} />
                                            </button>
                                        </FileDropper>
                                        <button
                                            type="button"
                                            className={classes.hover_button}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent modal from closing
                                                const newPortfolioCdnImages = [
                                                    ...portfolioCdnImages,
                                                ];
                                                newPortfolioCdnImages.splice(
                                                    index,
                                                    1
                                                );
                                                setPortfolioCdnImages(
                                                    newPortfolioCdnImages
                                                );
                                                setPortfolioCount(
                                                    portfolioCount - 1
                                                );

                                                setportfolioUrls((prevUrls) => {
                                                    const newUrls = [
                                                        ...prevUrls,
                                                    ];
                                                    newUrls[index] =
                                                        "/logo_main.jpg"; // Reset the URL to a default image
                                                    return newUrls;
                                                });
                                            }}
                                        >
                                            <MdClose size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        {portfolioCdnImages.length < 4 && (
                            <FileDropper
                                onFilesDropped={async (files) => {
                                    if (
                                        portfolioCount < 4 &&
                                        files &&
                                        files.length > 0
                                    ) {
                                        const file = files[0];
                                        const cdnResp = await uploadCdnFile(
                                            file
                                        );
                                        addPortfolioFile(cdnResp.r2file);
                                        setPortfolioCount(
                                            Math.min(portfolioCount + 1, 4)
                                        );
                                    }
                                }}
                                accept=".png,.jpg,.jpeg,.gif"
                            >
                                <div className={classes.user_upload_element}>
                                    <span>Upload</span>
                                </div>
                            </FileDropper>
                        )}
                    </div>
                    <button type="submit" className={classes.button}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserSettingsModal;
