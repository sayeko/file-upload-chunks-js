import ChunkConnection from "./chunk-connection";
import { splitToChunks } from "./file-analyzer";

export default class QueueChunkConnection {
  constructor(file) {
    this.queue = splitToChunks(file, QueueChunkConnection.CHUNK_SIZE).map(
      (chunk, chunkIndex) => {
        return {
          connection: new ChunkConnection(chunk),
          chunkIndex,
          status: QueueChunkConnection.STATUS.QUEUED
        };
      }
    );
    this.connectionIndex = 0;
  }

  processChunk() {
    return new Promise(async (resolve, reject) => {
      const chunkConnection = this.getNextConnection();

      try {
        const { connection } = chunkConnection;

        const result = await connection.uploadChunk();

        chunkConnection.status = QueueChunkConnection.STATUS.COMPLETE;

        if (this.isFileCompleted()) {
          return resolve(result);
        }

        this.processChunk();
      } catch (error) {
        console.error(
          `[QueueChunkConnection] chunk: ${
            chunkConnection.chunkIndex
          } failed to upload`,
          error
        );
        chunkConnection.status = QueueChunkConnection.STATUS.ERROR;
        reject(error);
      }
    });
  }

  getNextConnection() {
    return this.queue[this.connectionIndex];
  }

  isFileCompleted() {
    return this.connectionIndex.every(
      chunkConnection =>
        chunkConnection.status === QueueChunkConnection.STATUS.COMPLETE
    );
  }
}
QueueChunkConnection.CHUNK_SIZE = 5000000;
QueueChunkConnection.STATUS = {
  QUEUED: "queued",
  ERROR: "error",
  COMPLETE: "complete"
};
