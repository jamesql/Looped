import React, { useRef } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import classes from "../styles/filedropper.module.css";

interface FileDropperProps {
    onFilesDropped: (files: FileList) => void;
    accept?: string; // Specify accepted file types (e.g., ".png,.jpg,.jpeg,.pdf")
}

const FileDropper: React.FC<FileDropperProps> = ({ onFilesDropped, accept }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesDropped(event.dataTransfer.files);
            event.dataTransfer.clearData();
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            onFilesDropped(event.target.files);
        }
    };

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={classes.file_dropper}
            onClick={handleClick}
        >
            <div className={classes.file_dropper_content}>
                <MdCloudUpload size={30} />
                <p>Upload Files</p>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept={accept || ''} // Ensure the accept prop is passed correctly
                onChange={handleFileInputChange}
            />
        </div>
    );
};

export default FileDropper;