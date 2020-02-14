export default class ChunkRequest {
    constructor(chunk) {
        this.xhr = null;
        this.retries = 0;
        this.retryTimerId = null;
        this.chunk = chunk;
    }

    fire() {
        if (this.xhr) {
            console.warn("[ChunkRequest] There is already active request for this chunk request");
            return;
        }

        this.xhr = new XMLHttpRequest();

        this.xhr.onload = event => {
            console.error("[ChunkRequest] Chunk Loaded...", event);
        };
        this.xhr.onerror = event => {
            console.error("[ChunkRequest] Error...", event);

            this.retries++;

            if (ChunkRequest.MAX_RETRIES <= this.retries) {
                return {
                    type: "error",
                    errorMessage: "exceeded maximum retry attempts."
                };
            }

            // Retry with exponential back off (625ms, ~1.5s, ~4s, ~10s, ...).
            this.retryTimerId = setTimeout(() => {
                this.xhr = null;
                this.fire();
            }, Math.pow(ChunkRequest.EXPONENTIAL_FACTOR, this.retries) * 250);
        };
        this.xhr.onprogress = event => {
            console.error("[ChunkRequest] Loading Chunk...", event);
        };

        this.xhr.open("POST", ChunkRequest.URL);

        this.xhr.timeout = ChunkRequest.TIMEOUT;

        this.xhr.send(this.chunk);
    }

    abort() {
        if (!this.xhr) {
            console.warn(
                "[ChunkRequest] No active request"
            );
            return;
        }

        this.xhr.abort();

        // Clear retry mechanism.
        this.retries = 0;
        if (this.retryTimerId !== null) {
            this.retryTimerId = null;
            clearTimeout(this.retryTimerId);
        }
    }
}

ChunkRequest.MAX_RETRIES = 5;
ChunkRequest.EXPONENTIAL_FACTOR = 2.5;
ChunkRequest.TIMEOUT = 5000;
ChunkRequest.URL = "https://fakeurl.com/upload/chunk";
