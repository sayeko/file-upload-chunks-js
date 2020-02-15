export default class ChunkRequest {
    constructor(chunk, onSuccess, onFailure, onProgress) {
        this.xhr = null;
        this.retries = 0;
        this.retryTimerId = null;
        this.chunk = chunk;
        this.result = null;
        this.onSuccess = onSuccess || window.noop;
        this.onFailure = onFailure || window.noop;
        this.onProgress = onProgress || window.noop;
    }

    fire() {
        if (this.xhr) {
            console.warn("[ChunkRequest] There is already active request for this chunk request");
            return;
        }

        this.xhr = new XMLHttpRequest();

        this.xhr.onload = event => {
            console.error("[ChunkRequest] Chunk Loaded...", event);
            this.result = event;
            this.onSuccess(event);
        };
        this.xhr.onerror = event => {
            console.error("[ChunkRequest] Error...", event);

            this.retries++;

            if (ChunkRequest.MAX_RETRIES <= this.retries) {
                const error = {
                    type: "error",
                    errorMessage: "exceeded maximum retry attempts."
                };
                this.onFailure(error);
                return;
            }

            // Retry with exponential back off (625ms, ~1.5s, ~4s, ~10s, ...).
            this.retryTimerId = setTimeout(() => {
                this.xhr = null;
                this.fire();
            }, Math.pow(ChunkRequest.EXPONENTIAL_FACTOR, this.retries) * 250);
        };
        this.xhr.onprogress = event => {
            console.log("[ChunkRequest] Sent bytes chunk...", event);

            this.onProgress({
                loaded: event.loaded,
                total: this.chunk.totalBytesCount
            });
        };

        this.xhr.open("POST", ChunkRequest.URL);

        this.xhr.timeout = ChunkRequest.TIMEOUT;

        this.xhr.send(this.chunk);
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
            console.log(
                "[ChunkRequest] Aborted request", this.xhr
            );
        }

        this.xhr = null;
        this.result = null;
        this.retries = 0;
        clearTimeout(this.retryTimerId);
        this.retryTimerId = null;
    }
}

ChunkRequest.MAX_RETRIES = 5;
ChunkRequest.EXPONENTIAL_FACTOR = 2.5;
ChunkRequest.TIMEOUT = 5000;
ChunkRequest.URL = "https://fakeurl.com/upload/chunk";
