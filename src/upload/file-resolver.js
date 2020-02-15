import Chunk from './chunk';
import ChunkRequest from "./chunk-request";

export default class FileResolver {
    constructor() {
        this.queue = [];
        this.resolved = false;
        this.result = null;
        this.hash = null;
    }

    static createChunks(file, chunkSize) {
        const {size, type} = file;
        const chunksLength = Math.ceil(size / chunkSize);
        const chunks = [];
        let offset = 0;
        for (let chunkIndex = 0; chunkIndex < chunksLength; chunkIndex++) {
            const partialBlob = file.slice(offset, offset + chunkSize, type);
            offset += chunkSize;
            chunks.push(new Chunk(partialBlob, size, `${chunkIndex + 1}_${chunksLength}`))
        }

        return chunks;
    };

    initialize(file) {
        this.queue = FileResolver.createChunks(file, FileResolver.CHUNK_SIZE)
            .map((chunk, chunkIndex) => new ChunkRequest(chunk,
                result => {
                    const nextChunkRequest = this.queue[chunkIndex + 1];
                    if (!nextChunkRequest) {
                        this.resolved = true;
                        return;
                    }

                    nextChunkRequest.fire();
                },
                error => {
                    // Todo implement..
                    console.error('out', error)
                },
                progress => {
                    // Todo implement..
                    console.log('progress', progress)
                }));
    }

    start() {
        if (this.resolved) {
            return this.result;
        }

        this.queue[0].fire();
    }
}
FileResolver.CHUNK_SIZE = 5000000;