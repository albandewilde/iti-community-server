import { injectable } from "inversify";
import * as Stream from "stream";
import sharp = require('sharp');
import { PictureDimensions, PictureService } from "../../servicies/PictureService";

@injectable()
export class NodeSharpPictureService extends PictureService {
    private supportedMime = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/tiff"
    ]);

    resize(picture: Stream, ...dimensions: PictureDimensions[]): Stream[] {
        return dimensions.map(dim => this.resizePicture(picture, dim));
    }

    private resizePicture(picture: Stream, dimensions: { width?: number, height?: number }): Stream {
        return picture.pipe(sharp().resize(dimensions.width, dimensions.height, {

        }));
    }

    isFileSupported(mime: string): boolean {
        return this.supportedMime.has(mime);
    }
}
