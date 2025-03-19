## Description

A tiny, zero-dependency file upload tool that supports chunked upload and parallel upload.

## Install

```bash
npm i file-chunks-up
```

## Basic usage

```js
import fileUploader from "file-chunks-up";

const cancel = fileUploader({
  url: "/upload",
  method: "post",
  file,
  data: (chunk, index, totalChunks) => ({
    chunk,
    index,
    totalChunks,
  }),
  onUploadProgress(progress) {
    console.log("upload progress:", progress);
  },
  onSuccess(datas) {
    console.log("upload success", datas);
  },
});

// cancel upload somewhere
cancel();
```

## Options

|       property       |                                         description                                         |                                     type                                      |   default   |
| :------------------: | :-----------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------: | :---------: |
|         url          |                             The URL where the file is uploaded                              |                                   `string`                                    |      -      |
|        method        |                                     HTTP request method                                     |                                   `string`                                    |   `post`    |
|         file         |                                   The file to be uploaded                                   |                                    `Blob`                                     |      -      |
|      chunkSize       |                                 The size of each file chunk                                 |                                   `number`                                    |    `10M`    |
|       headers        |                                    HTTP request headers                                     |                             `Record<string, any>`                             |    `{}`     |
|    parallelCount     |                        Maximum number of concurrent upload requests                         |                                   `number`                                    |     `3`     |
| rejectOnRetryFailed  |               Should the upload progress be aborted when a chunk upload fails               |                                   `boolean`                                   |   `true`    |
|         data         |                                      HTTP request body                                      | `(chunk: Blob,chunkIndex: number,totalChunks: number) => Record<string, any>` | `() =>({})` |
|   onUploadProgress   |                     Triggered when an upload progress event is received                     |                         `(progress: number) => void`                          |      -      |
| onChunkUploadSuccess |                        Triggered when a file chunk uploaded success                         |                   `(data: unknown, meta: TaskMeta) => void`                   |      -      |
| onChunkUploadFialed  |                         Triggered when a file chunk uploaded fails                          |                   (error: unknown, meta: TaskMeta) => void                    |      -      |
|      onSuccess       |                          Triggered when the file uploaded success                           |                        `(datas: TaskResult[]) => void`                        |      -      |
|       onFailed       | Triggered when the file uploaded fails, only available when `rejectOnRetryFailed` is `true` |                          `(error: unknown) => void`                           |      -      |
|     onCancelled      |                           Triggered when the upload is cancelled                            |                          `(reason: unknown) => void`                          |      -      |
