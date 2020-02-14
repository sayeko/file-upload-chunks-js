import "./styles.css";
import Chunk from "./upload/chunk";
import ChunkRequest from './upload/chunk-request';

window.noop = function() {};

const createChunks = (file, chunkSize) => {
  const { size, type } = file;
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

const uploadButtonElement = document.getElementById("upload");
uploadButtonElement.addEventListener("change", event => {
  const file = event.target.files[0];
  const chunks = createChunks(file, 1000000);
  console.log(chunks);
  const reqs = chunks.map(chunk => new ChunkRequest(chunk));
  console.log(reqs);
  reqs[0].fire();

  setTimeout(() => {
    reqs[0].abort();
    console.log(reqs[0]);
  }, 1000);
});
