import Scheduler from "./scheduler";

function createTask(options: {
  delay: number;
  success?: boolean;
  result: unknown;
}) {
  const { delay, success = true, result } = options;

  return jest.fn(function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve(result);
        } else {
          reject(result);
        }
      }, delay);
    });
  });
}

describe("[Scheduler]", () => {
  it("should failed", (done) => {
    const scheduler = new Scheduler({
      retryTimes: 5,
      onTaskFailed(error) {
        expect(error).toBe(1);
      },
      onCompleted(results) {
        expect(results.length).toBe(1);
        expect(results[0].success).toBe(false);
        expect(results[0].result).toBe(1);
        done();
      },
    });
    const task = createTask({ delay: 100, result: 1, success: false });
    scheduler.addTask(task);
    scheduler.start();
  });

  it("should queue", () => {
    const scheduler = new Scheduler({
      parallelCount: 2,
    });
    const task1 = createTask({ delay: 100, result: 2 });
    const task2 = createTask({ delay: 200, result: 1 });
    const task3 = createTask({ delay: 50, result: 3 });
    scheduler.addTask(task1);
    scheduler.addTask(task2);
    scheduler.addTask(task3);
    scheduler.start();
    expect(task1).toHaveBeenCalled();
    expect(task2).toHaveBeenCalled();
    expect(task3).not.toHaveBeenCalled();
  });

  it("should success with matched results", (done) => {
    const scheduler = new Scheduler({
      parallelCount: 2,
      onCompleted(results) {
        expect(results.map((item) => item.success)).toEqual([true, true, true]);
        expect(results.map((item) => item.result)).toEqual([2, 1, 3]);
        done();
      },
    });
    scheduler.addTask(createTask({ delay: 100, result: 2 }));
    scheduler.addTask(createTask({ delay: 200, result: 1 }));
    scheduler.addTask(createTask({ delay: 50, result: 3 }));
    scheduler.start();
  });

  it("should cancel success", (done) => {
    const scheduler = new Scheduler({
      retryTimes: 0,
      onCancelled() {
        done();
      },
    });
    scheduler.addTask(createTask({ delay: 100, result: 2 }));
    scheduler.addTask(createTask({ delay: 200, result: 1 }));
    scheduler.addTask(createTask({ delay: 50, result: 3 }));
    scheduler.start();
    setTimeout(scheduler.cancel.bind(scheduler), 50);
  });

  it("should complete with failed results", (done) => {
    const scheduler = new Scheduler({
      retryTimes: 0,
      onCompleted(results) {
        let success = 0,
          failed = 0;
        results.forEach((item) => (item.success ? success++ : failed++));
        expect(success).toBe(2);
        expect(failed).toBe(1);
        expect(results.map((item) => item.result)).toEqual([2, 1, 3]);
        done();
      },
    });
    scheduler.addTask(createTask({ delay: 100, result: 2 }));
    scheduler.addTask(createTask({ delay: 200, result: 1, success: false }));
    scheduler.addTask(createTask({ delay: 50, result: 3 }));
    scheduler.start();
  });

  it("should reject when task failed", (done) => {
    const scheduler = new Scheduler({
      retryTimes: 0,
      rejectOnTaskFailed: true,
      onFailed() {
        done();
      },
    });
    scheduler.addTask(createTask({ delay: 100, result: 2 }));
    scheduler.addTask(createTask({ delay: 200, result: 1, success: false }));
    scheduler.addTask(createTask({ delay: 50, result: 3 }));
    scheduler.start();
  });
});
