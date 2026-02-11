/**
 * @fileoverview 浏览器 User-Agent 生成器，提供随机获取常见浏览器 UA 的功能
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供了一个 User-Agent 生成器类，支持：
 *          - Chrome 浏览器 UA
 *          - Firefox 浏览器 UA
 *          - Safari 浏览器 UA
 *          - Edge 浏览器 UA
 *          - 随机获取任意浏览器的 UA
 *
 *          使用方式：
 *          - 导入 UserAgentGenerator 类
 *          - 创建实例
 *          - 调用 getRandom() 或指定浏览器的方法
 *
 *          示例：
 *          - const ua = new UserAgentGenerator()
 *          - const chromeUA = ua.getChrome()
 *          - const randomUA = ua.getRandom()
 */

/**
 * User-Agent 生成器类
 * 提供随机获取各种浏览器 User-Agent 的功能
 */
export class UserAgentGenerator {
  /** Chrome 浏览器 UA 列表 */
  private readonly chromeUserAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  ];

  /** Firefox 浏览器 UA 列表 */
  private readonly firefoxUserAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
  ];

  /** Safari 浏览器 UA 列表 */
  private readonly safariUserAgents: string[] = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  ];

  /** Edge 浏览器 UA 列表 */
  private readonly edgeUserAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.80',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.2792.79',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.80',
  ];

  /** 所有浏览器的 UA 列表 */
  private readonly allUserAgents: string[];

  constructor() {
    // 合并所有浏览器的 UA
    this.allUserAgents = [
      ...this.chromeUserAgents,
      ...this.firefoxUserAgents,
      ...this.safariUserAgents,
      ...this.edgeUserAgents,
    ];
  }

  /**
   * 从数组中随机选择一个元素
   * @param array - 可选的数组，如果不提供则使用所有 UA 列表
   * @returns 随机选择的 User-Agent 字符串
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 获取随机 Chrome 浏览器 UA
   * @returns Chrome User-Agent 字符串
   */
  getChrome(): string {
    return this.randomChoice(this.chromeUserAgents);
  }

  /**
   * 获取随机 Firefox 浏览器 UA
   * @returns Firefox User-Agent 字符串
   */
  getFirefox(): string {
    return this.randomChoice(this.firefoxUserAgents);
  }

  /**
   * 获取随机 Safari 浏览器 UA
   * @returns Safari User-Agent 字符串
   */
  getSafari(): string {
    return this.randomChoice(this.safariUserAgents);
  }

  /**
   * 获取随机 Edge 浏览器 UA
   * @returns Edge User-Agent 字符串
   */
  getEdge(): string {
    return this.randomChoice(this.edgeUserAgents);
  }

  /**
   * 获取随机任意浏览器的 UA
   * @returns 随机的 User-Agent 字符串
   */
  getRandom(): string {
    return this.randomChoice(this.allUserAgents);
  }

  /**
   * 获取指定浏览器的随机 UA
   * @param browser - 浏览器类型（chrome、firefox、safari、edge）
   * @returns 对应浏览器的 User-Agent 字符串
   */
  getByBrowser(browser: 'chrome' | 'firefox' | 'safari' | 'edge'): string {
    switch (browser) {
      case 'chrome':
        return this.getChrome();
      case 'firefox':
        return this.getFirefox();
      case 'safari':
        return this.getSafari();
      case 'edge':
        return this.getEdge();
      default:
        return this.getRandom();
    }
  }
}

/** 导出默认实例，方便直接使用 */
export const userAgentGenerator = new UserAgentGenerator();

/** 导出默认函数，提供更简洁的调用方式 */
export default function getRandomUserAgent(): string {
  return userAgentGenerator.getRandom();
}