import { Router, Request, Response } from "express";
import { FileStorage } from "modules/user/servicies/FileStorage";
import * as mime from "mime-types";
import { validateParams } from "modules/common/validator";
import { IsString } from "class-validator";

class FileQuery {
    @IsString()
    name: string;
}

export const FileRouter = function (fileStorageFn: () => FileStorage) {
    return Router()
        .get("/:type/:name", validateParams(FileQuery), (req: Request, res: Response) => {
            try {
                const fileStorage = fileStorageFn();
                const stream = fileStorage.read(`${req.params.type}/${req.params.name}`);
                res.setHeader("content-type", mime.lookup(req.params.name) as string);
                stream.on("error", (e) => {
                    res.status(404);
                    res.send("");
                });
                stream.pipe(res);
            } catch (e) {
                res.status(500);
                res.send("");
            }
        })
}