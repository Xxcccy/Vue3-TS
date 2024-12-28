/**
 * 节流函数
 * @param fn 目标函数
 * @param wait 等待时间
 * @returns new function
 */
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
