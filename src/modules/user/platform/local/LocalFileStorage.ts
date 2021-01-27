import { FileStorage } from "modules/user/servicies/FileStorage";
import { Readable, Stream } from "stream";
import * as fs from "fs-extra";
import * as path from "path";
import { resolve } from "dns";

export class LocalFileStorage extends FileStorage {
    constructor(private folderPath: string) {
        super();
    }

    async save(destination: string, stream: Stream): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const dest = this.getFullPath(destination);
            await this.ensureDestination(dest);
            const writeStream = fs.createWriteStream(dest);
            stream.pipe(writeStream);
            writeStream.on('finish', () => {
                resolve();
            });
            writeStream.on('error', (e) => {
                reject(e);
            }); 
        });
    }

    read(location: string): Readable {
        return fs.createReadStream(this.getFullPath(location));
    }

    delete(location: string): Promise<void> {
        return fs.remove(this.getFullPath(location))
    }

    private getFullPath(filePath: string) {
        return path.resolve(this.folderPath, filePath);
    }

    private async ensureDestination(destination: string) {
        const dir = path.dirname(destination);
        try {
            await fs.access(dir);
        } catch (error) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}