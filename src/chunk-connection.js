export default class ChunkConnection {
  constructor(chunk) {
    this.xhr = null;
    this.retries = 0;
    this.retryId = null;
    this.chunk = chunk;
  }

  uploadChunk() {
    if (!this.xhr) {
      this.xhr = new XMLHttpRequest();
    }

    return new Promise((resolve, reject) => {
      // Append request xhr listener.
      this.xhr.onload = event => {
        console.error("[ChunkConnection] Chunk Loaded...", event);
        resolve(this._onLoadChunk());
      };
      this.xhr.onerror = event => {
        console.error("[ChunkConnection] Error...", event);
        const error = this._onErrorChunk();

        if (!error) {
          return;
        }

        reject(error);
      };
      this.xhr.onprogress = event => {
        console.error("[ChunkConnection] Loading Chunk...", event);
        this._onProgressChunk();
      };

      this.xhr.open("GET", ChunkConnection.URL);

      this.xhr.timeout = ChunkConnection.TIMEOUT;

      this.xhr.send(this.chunk);
    });
  }

  _onLoadChunk() {}

  _onErrorChunk() {
    this.retries++;

    if (ChunkConnection.MAX_RETRIES <= this.retries) {
      return {
        type: "error",
        errorMessage: "exceeded maximum retry attempts."
      };
    }

    // Retry with exponential backoff (625ms, ~1.5s, ~4s, ~10s, ...).
    this.retryId = setTimeout(() => {
      // Reset the xhr connection.
      this.xhr = null;
      // Re upload the chunk.
      this.uploadChunk();
    }, Math.pow(2.5, this.retries) * 250);
  }

  _onProgressChunk() {}

  abort() {
    if (!this.xhr) {
      console.warn(
        "[ChunkConnection] You cannot abort an not exist connection."
      );
    }

    this.xhr.abort();

    this.retries = 0;
    this.retryTimer = null;
    clearTimeout(this.retryTimer);
  }
}

ChunkConnection.MAX_RETRIES = 5;
ChunkConnection.TIMEOUT = 5000;
ChunkConnection.URL = "https://fakeurl.com/upload/chunk";
