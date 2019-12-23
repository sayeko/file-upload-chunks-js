import ChunkConnection from "./chunk-connection";
import { splitToChunks } from "./file-analyzer";

export default class ChunkConnectionPool {
  constructor(file) {
    this.connectionPool = splitToChunks(
      file,
      ChunkConnectionPool.CHUNK_SIZE
    ).map((chunk, chunkIndex) => {
      return {
        connection: new ChunkConnection(chunk),
        chunkIndex,
        status: ChunkConnectionPool.STATUS.QUEUED
      };
    });
    this.connectionIndex = 0;
  }

  processChunk() {
    return new Promise((resolve, reject) => {
      const chunkConnection = this.getConnection();

      chunkConnection.connection.uploadChunk();

      this.connectionPool.push(chunkConnection);

      chunkConnection
        .uploadChunk(this._onSucessUpload, this._onErrorUpload)
        .then(result => {
          const chunkConnection = this.getConnection();
          chunkConnection.status = ChunkConnectionPool.STATUS.COMPLETE;

          if (this.isFileCompleted()) {
            return resolve(result);
          }

          this.processChunk();
        })
        .catch(error => {
          const chunkConnection = this.getConnection();
          chunkConnection.status = ChunkConnectionPool.STATUS.ERROR;
          reject(error);
        });
    });
  }

  getConnection() {
    return this.connectionPool[this.connectionIndex];
  }

  isFileCompleted() {
    return this.connectionIndex.every(
      chunkConnection =>
        chunkConnection.status === ChunkConnectionPool.STATUS.COMPLETE
    );
  }
}
ChunkConnectionPool.CHUNK_SIZE = 5000000;
ChunkConnectionPool.STATUS = {
  QUEUED: "queued",
  ERROR: "error",
  COMPLETE: "complete"
};
