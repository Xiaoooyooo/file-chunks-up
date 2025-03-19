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
export default class Scheduler {
    private tasks;
    private results;
    private runningCount;
    private readonly options;
    private abortController;
    private status;
    constructor(options?: Partial<SchedulerOptions>);
    addTask(task: Task): void;
    private handleComplete;
    private handleFailed;
    private handleCancel;
    private run;
    start(): void;
    cancel(reason?: unknown): void;
}
export {};
