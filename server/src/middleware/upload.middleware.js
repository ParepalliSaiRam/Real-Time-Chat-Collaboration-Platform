import multer from "multer";
import path from "path";

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, "uploads/");
    },

    filename(req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName +
            path.extname(file.originalname)
        );

    }

});

const fileFilter = (req, file, cb) => {

    const allowed = [

        "image/png",

        "image/jpeg",

        "application/pdf"

    ];

    if (allowed.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Unsupported file type"));

    }

};

export const uploadSingle = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single("file");