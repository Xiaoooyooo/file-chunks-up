import fileUploader from "file-chunks-up";
const input = document.getElementById("input");
const upload = document.getElementById("upload");
const cancel = document.getElementById("cancel");
const progressBar = document.getElementById("progress-bar");
const progress = document.getElementById("progress");
const result = document.getElementById("result");

let cancelHandler = null;
upload.addEventListener("click", function () {
  const file = input.files[0];
  if (!file) {
    return;
  }
  progressBar.value = 0;
  progress.innerText = "0";
  result.innerText = "";
  cancelHandler = fileUploader({
    url: "http://127.0.0.1:8888/upload",
    method: "post",
    file,
    chunkSize: 10 * 1024 * 1024,
    data: (chunk, index, totalChunks) => ({
      chunk,
      index,
      totalChunks,
    }),
    onUploadProgress(p) {
      progressBar.value = p;
      progress.innerText = `${p === 1 ? 100 : (p * 100).toFixed(2)}%`;
    },
    onChunkUploadSuccess(data) {
      console.log("onChunkUploadSuccess", data);
    },
    onChunkUploadFialed(error) {
      console.log("onChunkUploadFialed", error);
    },
    onSuccess(datas) {
      console.log("upload success", datas);
      result.innerText = "upload success!";
      result.style.color = "#22C55E";
    },
    onFailed(error) {
      console.log("upload failed", error);
      result.innerText = "upload failed!";
      result.style.color = "#EF4444";
    },
    onCancelled(reason) {
      console.log("upload cancelled", reason);
      result.innerText = "upload cancelled!";
      result.style.color = "#A8A29E";
    },
  });
});

cancel.addEventListener("click", function () {
  if (cancelHandler) {
    cancelHandler();
    cancelHandler = null;
  }
});
