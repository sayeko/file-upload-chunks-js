import BrowserFile from "./browser-file";

export default class FileManager {
  constructor() {
    this.queue = [];
  }

  add(file) {
    if (file instanceof File) {
      this.queue.push(new BrowserFile(file));
    }

    requestIdleCallback(idleDeadline => {
      console.log(`${idleDeadline.timeRemaining()}ms`, idleDeadline);

      this.queue.forEach(file => {
        file.upload();
      });
    });
  }
}
