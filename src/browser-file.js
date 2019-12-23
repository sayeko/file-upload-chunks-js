import ChunkConnectionPool from "./chunk-connection-pool";

export default class BrowserFile {
  constructor(file) {
    if (!(file instanceof File)) {
      throw new Error("This file object is not from type [File].");
    }

    this.status = BrowserFile.STATUS.INIT;
    this.uuid = `file-${Date.now()}`;
    this.chunkConnectionPool = new ChunkConnectionPool(file);

    console.log(`[BrowserFile] Created new browser file object: ${this.uuid}`);
  }

  upload() {
    // Can't create a new connection while have one in progress.
    if (this.status === BrowserFile.STATUS.PROGRESS) {
      return;
    }

    this.status = BrowserFile.STATUS.PROGRESS;

    this.chunkConnectionPool
      .processChunk()
      .then(result => console.log(result))
      .catch(error => console.error(error));

    // Handler has to send the next chunk
    // When chunk completed.

    // this.connection.setRequestHeader("Content-Type", this.contentType);
  }

  abort() {
    if (!this.connection) {
      console.warn(`[BrowserFile] Cant abort not open connection`);
      return;
    }

    this.connection.abort();
  }
}

BrowserFile.STATUS = {
  INIT: "init",
  PROGRESS: "progress",
  COMPLETED: "completed",
  PAUSED: "paused",
  ERROR: "error"
};