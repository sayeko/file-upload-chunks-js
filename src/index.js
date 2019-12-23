import FileManager from "./file-manager";
import "./styles.css";

window.noop = function() {};
window.FileManager = new FileManager();

const uploadButtonElement = document.getElementById("upload");
uploadButtonElement.addEventListener("change", event => {
  const file = event.target.files[0];
  window.FileManager.add(file);
});
