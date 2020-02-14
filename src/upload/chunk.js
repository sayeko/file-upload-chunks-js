export default class Chunk {
    constructor(blob, size, chunkId) {
        this.blob = blob;
        this.totalBytesCount = size;
        this.chunkId = chunkId;
    }
}