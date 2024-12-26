export function throttle(fn: Function, wait: number): any {
  let preivous = 0;

  return function (this: unknown, ...args: Array<any>): any {
    const now = +new Date();

    if (now - preivous > wait) {
      fn.apply(this, args);
      preivous = now;
    }
  };
}
