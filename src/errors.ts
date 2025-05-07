export class SchedulerCancelError extends Error {
  name = "SchedulerCancelError";
  constructor() {
    super("Scheduler has been cancelled.");
  }
}

export class SchedulerTaskFailedError extends Error {
  name = "SchedulerTaskFailedError";
  constructor() {
    super("The scheduler was cancelled due to a task execution failure.");
  }
}

export class UploadTimeoutError extends Error {
  name = "UploadTimeoutError";
  constructor() {
    super("Upload timeout.");
  }
}

export class UploadAbortedError extends Error {
  name = "UploadAbortedError";
  constructor() {
    super("Upload aborted.");
  }
}
