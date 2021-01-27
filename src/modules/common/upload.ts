import { NextFunction, Request, Response } from "express";
import { File } from "formidable";
const formidable = require("formidable");

export function multipart() {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const form = formidable({ multiples: true, hash: "sha256" });
            form.maxFileSize = 512 * 1024 * 1024;
            form.parse(req, (err, fields, files: { [name: string]: File }) => {
                if (err) {
                    next(err);
                } else {
                    req.body = fields;
                    for (let prop in files) {
                        req.body[prop] = {
                            name: files[prop].name,
                            path: files[prop].path,
                            hash: files[prop].hash,
                            type: files[prop].type
                        }
                    }
                    next();
                }
            });
        } catch (e) {
            next(e);
        }
    };
}

export interface UploadedFile {
    name: string;
    path: string;
    type: string;
}
