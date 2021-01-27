import { injectable } from "inversify";
import { Stream } from "stream";

// TODO change dimensions system

export interface PictureDimensions {
    width?: number;
    height?: number;
}

@injectable()
export abstract class PictureService {
    abstract isFileSupported(mimeType: string): boolean;

    abstract resize(picture: Stream, ...dimensions: PictureDimensions[]): Stream[];
}
