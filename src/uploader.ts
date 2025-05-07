import { UploadAbortedError, UploadTimeoutError } from "./errors";

type UploaderOptions = {
  url: string;
  method: string;
  data: Record<string, any>;
  headers: Record<string, string>;
  signal: AbortSignal;
  onProgress: (loaded: number, total: number) => void;
};

export default function uploader<T = unknown>(options: UploaderOptions) {
  return new Promise<T>((resolve, reject) => {
    const { url, method, data, headers, signal, onProgress } = options;
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = "json";
    for (const header in headers) {
      xhr.setRequestHeader(header, headers[header]);
    }
    const formData = new FormData();
    for (const key in data) {
      if (typeof data[key] === "string" || data[key] instanceof Blob) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, JSON.stringify(data[key]));
      }
    }

    signal.addEventListener("abort", () => {
      xhr.abort();
    });

    xhr.addEventListener("load", function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as T);
      } else {
        reject(xhr.response);
      }
    });
    xhr.addEventListener("abort", function () {
      reject(new UploadAbortedError());
    });
    xhr.addEventListener("error", function () {
      reject(xhr.response);
    });
    xhr.addEventListener("timeout", function () {
      reject(new UploadTimeoutError());
    });
    xhr.upload.addEventListener("progress", function (e) {
      onProgress(e.loaded, e.total);
    });
    xhr.send(formData);
  });
}
