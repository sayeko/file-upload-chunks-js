import Chunk from './chunk';
import ChunkRequest from "./chunk-request";

export default class FileResolver {
    constructor(file) {
        this.queue = [];
        this.resolved = false;
        this.hash = null;
    }

    start() {
    }
}
// FileResolver.CHUNK_SIZE = 5000000;