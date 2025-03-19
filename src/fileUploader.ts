import { noop, splitChunks } from "./helpers";
import uploader from "./uploader";
import Scheduler, { type TaskMeta, type TaskResult } from "./scheduler";

type FileUploaderOptions = {
  url: string;
  file: Blob;
  method?: string;
  headers?: Record<string, string>;
  chunkSize?: number;
  parallelCount?: number;
  rejectOnRetryFailed?: boolean;
  data?: (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
  ) => Record<string, any>;
  onUploadProgress?: (progress: number) => void;
  onChunkUploadSuccess?: (data: unknown, meta: TaskMeta) => void;
  onChunkUploadFialed?: (error: unknown, meta: TaskMeta) => void;
  onSuccess?: (datas: TaskResult[]) => void;
  onFailed?: (error: unknown) => void;
  onCancelled?: (reason: unknown) => void;
};

type CancelUpload = (reason?: unknown) => void;

export default function fileUploader(
  options: FileUploaderOptions,
): CancelUpload {
  const {
    url,
    file,
    method = "post",
    headers = {},
    chunkSize = 10 * 1024 * 1024, // 10M
    parallelCount = 3,
    rejectOnRetryFailed = true,
    data: getData = () => ({}),
    onChunkUploadSuccess = noop,
    onChunkUploadFialed = noop,
    onUploadProgress = noop,
    onFailed = noop,
    onSuccess = noop,
    onCancelled = noop,
  } = options;

  const allChunks = splitChunks(file, chunkSize);

  const scheduler = new Scheduler({
    retryTimes: 3,
    parallelCount,
    rejectOnTaskFailed: rejectOnRetryFailed,
    onTaskCompleted: onChunkUploadSuccess,
    onTaskFailed: onChunkUploadFialed,
    onCompleted: onSuccess,
    onFailed: onFailed,
    onCancelled: onCancelled,
  });

  const totalSizeMap = new Map(
    allChunks.map(([start, end], index) => [index, end - start]),
  );

  const loadedSizeMap = new Map<number, number>();

  allChunks.forEach(([start, end], index) => {
    scheduler.addTask((signal) => {
      const data = getData(file.slice(start, end), index, allChunks.length);
      loadedSizeMap.set(index, 0);
      return uploader({
        url,
        data,
        method,
        headers,
        signal,
        onProgress(loaded, total) {
          totalSizeMap.set(index, total);
          loadedSizeMap.set(index, loaded);
          const loadedSize = Array.from(loadedSizeMap.values()).reduce(
            (c, p) => c + p,
          );
          const totalSize = Array.from(totalSizeMap.values()).reduce(
            (c, p) => c + p,
          );
          onUploadProgress(loadedSize / totalSize);
        },
      });
    });
  });

  scheduler.start();

  return (reason?: unknown) => {
    scheduler.cancel(reason);
  };
}
