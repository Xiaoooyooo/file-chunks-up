type Task = (signal: AbortSignal) => Promise<any>;
type TaskManagerOptions = {
  parallelCount: number;
  retryTimes: number;
  onTaskCompleted: (result: unknown) => void;
  onTaskFailed: (error: unknown) => void;
  onCompleted: (results: unknown[]) => void;
  onFailed: (error: any, canceled: boolean) => void;
};
export default class TaskManager {
  private tasks;
  private results;
  private runningCount;
  private readonly options;
  private abortController;
  constructor(options?: Partial<TaskManagerOptions>);
  addTask(task: Task): void;
  private run;
  start(): void;
  cancel(): void;
}
export {};
