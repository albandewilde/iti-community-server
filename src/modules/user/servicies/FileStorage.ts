import { injectable } from "inversify";
import { Readable, Stream } from "stream";

@injectable()
export abstract class FileStorage {
    abstract save(destination: string, stream: Stream): Promise<void>;

    abstract read(location: string): Readable;

    abstract delete(path: string): Promise<void>;
}
