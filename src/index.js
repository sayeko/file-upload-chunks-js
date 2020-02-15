import FileResolver from "./upload/file-resolver";
import "./styles.css";

window.noop = function() {};

const uploadButtonElement = document.getElementById("upload");
uploadButtonElement.addEventListener("change", event => {
  const file = event.target.files[0];
  const fileResolver = new FileResolver();
  fileResolver.initialize(file);
  fileResolver.start();
  console.log(fileResolver);
});
