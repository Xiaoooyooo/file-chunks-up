import { noop } from "./helpers";
import { CancelTaskError } from "./errors";

type Task = (signal: AbortSignal) => Promise<unknown>;
export type TaskMeta = {
  index: number;
  leftRetryTimes: number;
};
export type TaskResult = {
  success: boolean;
  result: unknown;
};

type SchedulerOptions = {
  parallelCount: number;
  retryTimes: number;
  rejectOnTaskFailed: boolean;
  onTaskCompleted: (result: unknown, meta: TaskMeta) => void;
  onTaskFailed: (error: unknown, meta: TaskMeta) => void;
  onCompleted: (results: TaskResult[]) => void;
  onFailed: (error: unknown) => void;
  onCancelled: (reason?: unknown) => void;
};

const defaultOptions: SchedulerOptions = {
  parallelCount: 3,
  retryTimes: 3,
  rejectOnTaskFailed: false,
  onTaskCompleted: noop,
  onTaskFailed: noop,
  onCompleted: noop,
  onFailed: noop,
  onCancelled: noop,
};

export default class Scheduler {
  private tasks: { task: Task; meta: TaskMeta }[] = [];
  private results: TaskResult[] = [];
  private runningCount = 0;
  private readonly options: SchedulerOptions;
  private abortController: AbortController | null;
  private status: "idle" | "running" | "completed" | "failed" = "idle";

  constructor(options?: Partial<SchedulerOptions>) {
    this.options = { ...defaultOptions, ...options };
  }

  addTask(task: Task) {
    const { retryTimes } = this.options;
    this.tasks.push({
      task: function (signal) {
        return new Promise((resolve, reject) => {
          signal.addEventListener("abort", function () {
            reject(new CancelTaskError());
          });
          task(signal).then(resolve, reject);
        });
      },
      meta: { index: this.tasks.length, leftRetryTimes: retryTimes },
    });
  }

  private handleComplete() {
    if (this.status === "running") {
      this.status = "completed";
      this.options.onCompleted(this.results);
    }
  }

  private handleFailed(reason: unknown) {
    if (this.status === "running") {
      this.status = "failed";
      this.options.onFailed(reason);
    }
  }

  private handleCancel(reason?: unknown) {
    if (this.status === "running") {
      this.status = "failed";
      this.options.onCancelled(reason);
    }
  }

  private async run() {
    const { parallelCount, rejectOnTaskFailed, onTaskFailed, onTaskCompleted } =
      this.options;
    if (this.tasks.length === 0) {
      if (this.runningCount === 0) {
        this.handleComplete();
      }
      return;
    }
    if (this.runningCount === parallelCount) {
      return;
    }
    const { task, meta } = this.tasks.shift()!;
    let shouldContinue = true;
    this.runningCount++;
    try {
      const result = await task(this.abortController!.signal);
      onTaskCompleted(result, meta);
      this.results[meta.index] = { success: true, result };
    } catch (error) {
      if (error instanceof CancelTaskError) {
        shouldContinue = false;
      }
      if (meta.leftRetryTimes > 0) {
        meta.leftRetryTimes--;
        // 重新加到队列头部
        this.tasks.unshift({ task, meta });
      } else {
        this.results[meta.index] = { success: false, result: error };
        onTaskFailed(error, meta);
        if (rejectOnTaskFailed) {
          this.handleFailed(error);
          this.cancel();
          shouldContinue = false;
        }
      }
    }
    this.runningCount--;
    if (shouldContinue) {
      this.run();
    }
  }

  start() {
    const { parallelCount } = this.options;
    const len = this.tasks.length;
    this.results = Array(len).fill(undefined);
    this.abortController = new AbortController();
    this.status = "running";
    for (let i = 0; i < parallelCount && i < len; i++) {
      this.run();
    }
  }

  cancel(reason?: unknown) {
    this.tasks = [];
    reason = reason || new Error("Upload progress cancelled!");
    if (this.abortController) {
      this.abortController.abort(new CancelTaskError());
      this.abortController = null;
    }
    this.handleCancel(reason);
  }
}
