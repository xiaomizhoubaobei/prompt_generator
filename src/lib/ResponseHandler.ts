/**
 * @fileoverview 响应处理类，统一处理 HTTP 响应码和业务错误码
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供了一个响应处理类，用于统一处理：
 *          - HTTP 状态码（4xx、5xx）
 *          - 业务错误码（负数，如 -10001）
 *          - 响应体中的错误信息
 *          - 支持中文、英文、日文三种语言
 *
 *          使用方式：
 *          - 导入 ResponseHandler 类
 *          - 创建实例
 *          - 调用相应方法处理错误
 *
 *          示例：
 *          - const handler = new ResponseHandler()
 *          - const message = handler.getErrorMessage(error, 'chinese')
 */

/**
 * 支持的语言类型
 */
export type Language = 'chinese' | 'english' | 'japanese';

/**
 * 业务错误码对应的错误消息配置
 */
interface BusinessErrorMessages {
  [key: string]: {
    chinese: string;
    english: string;
    japanese: string;
  };
}

/**
 * HTTP 状态码对应的错误消息配置
 */
interface HttpStatusMessages {
  [key: string]: {
    chinese: string;
    english: string;
    japanese: string;
  };
}

/**
 * 响应处理类
 * 统一处理 HTTP 响应码和业务错误码
 */
export class ResponseHandler {
  /** 获取官网链接 */
  private getOfficialWebsite(): string {
    return import.meta.env.VITE_APP_REGION
      ? import.meta.env.VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL
      : import.meta.env.VITE_APP_OFFICIAL_WEBSITE_URL_CHINA;
  }

  /** 业务错误码映射 */
  private readonly businessErrors: BusinessErrorMessages = {
    "-10001": {
      chinese: `账户凭证丢失，请 <a style='text-decoration: underline; color: #0070f0' href='/auth'>重新登录</a>`,
      english: `Account credentials lost, Please <a style='text-decoration: underline; color: #0070f0' href='/auth'>log in again</a>`,
      japanese: `アカウント資格情報が失われました。<a style='text-decoration: underline; color: #0070f0' href='/auth'>再度ログイン</a> してください`,
    },
    "-10003": {
      chinese: "网络错误，请稍后重试",
      english: "Network error, please try again later.",
      japanese: "ネットワークエラーが発生しました。後でもう一度お試しください。",
    },
    "-10005": {
      chinese: `账户凭证过期，请 <a style='text-decoration: underline; color: #0070f0' href='/auth'>重新登录</a>`,
      english: `Account credentials expired, Please <a style='text-decoration: underline; color: #0070f0' href='/auth'>log in again</a>`,
      japanese: `アカウント資格情報の有効期限が切れました。<a style='text-decoration: underline; color: #0070f0' href='/auth'>再度ログイン</a> してください`,
    },
  };

  /** 获取动态业务错误消息（包含动态链接） */
  private getDynamicBusinessErrorMessage(code: number, language: Language): string {
    const officialWebsite = this.getOfficialWebsite();

    const dynamicMessages: BusinessErrorMessages = {
      "-10002": {
        chinese: `该工具已禁用/删除，更多请访问 <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `This tool is disabled / deleted, Please refer to <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `このツールは無効化されました。詳細については <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10004": {
        chinese: `账户余额不足，创建属于自己的工具，更多请访问 <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `Insufficient account balance, Please view <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> to create your own tools.`,
        japanese: `アカウントの残高が不足しています。詳細については <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10006": {
        chinese: `账户总额度已达上限，更多请访问 <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `This tool's total quota reached maximum limit, Please refer to <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `アカウントの総クォータが上限に達しました。詳細については <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10007": {
        chinese: `账户日额度已达上限，更多请访问 <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `This tool's daily quota reached maximum limit, Please refer to <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `アカウントの日次クォータが上限に達しました。詳細については <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10008": {
        chinese: `当前无可用通道，更多请访问 <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `No available channels at the moment, Please refer to <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `現在利用できるチャンネルはありません。詳細については <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10009": {
        chinese: `不支持当前API功能，更多请访问 <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `API function is not supported, Please refer to <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `現在のAPI機能はサポートされていません。詳細については <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
      "-10012": {
        chinese: `该免费工具在本小时的额度已达上限，请访问 <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> 生成属于自己的工具`,
        english: `This free tool's hour quota reached maximum limit. Please view <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> to create your own tool`,
        japanese: `この無料ツールは今時間の上限に達しました。 <a style='color:#0070f0;text-decoration:underline' href='${officialWebsite}' target='_blank'>302.AI</a> を訪問して自分のツールを作成してください`,
      },
      "-1024": {
        chinese: `AI接口连接超时，更多请访问 <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a>`,
        english: `AI interface connection timed out, Please refer to <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> for details.`,
        japanese: `AIインターフェース接続がタイムアウトしました。詳細については <a style='text-decoration: underline; color: #0070f0' href='${officialWebsite}' target='_blank'>302.AI</a> をご覧ください。`,
      },
    };

    if (dynamicMessages[code.toString()]) {
      return dynamicMessages[code.toString()][language];
    }
    return this.getUnknownErrorMessage(language);
  }

  /** HTTP 状态码映射 */
  private readonly httpStatusCodes: HttpStatusMessages = {
    "400": {
      chinese: "请求参数错误",
      english: "Bad request, invalid parameters",
      japanese: "リクエストパラメータが無効です",
    },
    "401": {
      chinese: "未授权，请检查 API Key",
      english: "Unauthorized, please check your API Key",
      japanese: "認証されていません。API Key を確認してください",
    },
    "403": {
      chinese: "禁止访问，权限不足",
      english: "Forbidden, insufficient permissions",
      japanese: "アクセスが禁止されています。権限が不足しています",
    },
    "404": {
      chinese: "请求的资源不存在",
      english: "The requested resource does not exist",
      japanese: "要求されたリソースが存在しません",
    },
    "429": {
      chinese: "请求过于频繁，请稍后重试",
      english: "Too many requests, please try again later",
      japanese: "リクエストが多すぎます。後でもう一度お試しください",
    },
    "500": {
      chinese: "服务器内部错误，请稍后重试",
      english: "Internal server error, please try again later",
      japanese: "サーバー内部エラーが発生しました。後でもう一度お試しください",
    },
    "502": {
      chinese: "网关错误，请稍后重试",
      english: "Bad gateway, please try again later",
      japanese: "ゲートウェイエラーが発生しました。後でもう一度お試しください",
    },
    "503": {
      chinese: "服务暂时不可用，请稍后重试",
      english: "Service temporarily unavailable, please try again later",
      japanese: "サービスが一時的に利用できません。後でもう一度お試しください",
    },
    "504": {
      chinese: "网关超时，请稍后重试",
      english: "Gateway timeout, please try again later",
      japanese: "ゲートウェイタイムアウトが発生しました。後でもう一度お試しください",
    },
  };

  /**
   * 获取业务错误码对应的错误消息
   * @param code - 业务错误码（负数）
   * @param language - 语言类型
   * @returns 错误消息字符串
   */
  getBusinessErrorMessage(code: number, language: Language): string {
    // 先检查静态错误消息
    const error = this.businessErrors[code.toString()];
    if (error) {
      return error[language];
    }
    // 再检查动态错误消息（包含动态链接）
    return this.getDynamicBusinessErrorMessage(code, language);
  }

  /**
   * 获取 HTTP 状态码对应的错误消息
   * @param code - HTTP 状态码
   * @param language - 语言类型
   * @returns 错误消息字符串
   */
  getHttpStatusMessage(code: number, language: Language): string {
    const error = this.httpStatusCodes[code.toString()];
    if (error) {
      return error[language];
    }
    return this.getGenericHttpErrorMessage(code, language);
  }

  /**
   * 获取未知错误的错误消息
   * @param language - 语言类型
   * @returns 错误消息字符串
   */
  getUnknownErrorMessage(language: Language): string {
    const messages = {
      chinese: '未知错误',
      english: 'Unknown error',
      japanese: '不明なエラー',
    };
    return messages[language];
  }

  /**
   * 获取通用的 HTTP 错误消息
   * @param code - HTTP 状态码
   * @param language - 语言类型
   * @returns 错误消息字符串
   */
  getGenericHttpErrorMessage(code: number, language: Language): string {
    const messages = {
      chinese: `HTTP 错误 ${code}`,
      english: `HTTP Error ${code}`,
      japanese: `HTTP エラー ${code}`,
    };
    return messages[language];
  }

  /**
   * 从错误对象中提取错误消息
   * 按优先级检查：业务错误码 > HTTP 状态码 > 未知错误
   * @param error - 错误对象
   * @param language - 语言类型
   * @returns 错误消息字符串
   */
  async getErrorMessage(error: any, language: Language): Promise<string> {
    // 尝试解析响应体中的错误
    if (error.response) {
      try {
        const result = await error.response.json();
        // 优先检查业务错误码
        if (result?.error?.err_code) {
          return this.getBusinessErrorMessage(result.error.err_code, language);
        }
        // 检查 HTTP 状态码
        if (error.response.status) {
          return this.getHttpStatusMessage(error.response.status, language);
        }
      } catch {
        // JSON 解析失败，检查状态码
        if (error.response.status) {
          return this.getHttpStatusMessage(error.response.status, language);
        }
      }
    }

    // 检查直接传入的数字错误码
    if (typeof error === 'number') {
      if (error < 0) {
        return this.getBusinessErrorMessage(error, language);
      }
      return this.getHttpStatusMessage(error, language);
    }

    // 默认返回未知错误
    return this.getUnknownErrorMessage(language);
  }

  /**
   * 检查错误码是否为业务错误码
   * @param code - 错误码
   * @returns 是否为业务错误码
   */
  isBusinessErrorCode(code: number): boolean {
    return code < 0 && this.businessErrors.hasOwnProperty(code);
  }

  /**
   * 检查状态码是否为 HTTP 状态码
   * @param code - 状态码
   * @returns 是否为 HTTP 状态码
   */
  isHttpStatusCode(code: number): boolean {
    return code >= 100 && code < 600;
  }

  /**
   * 检查状态码是否为客户端错误（4xx）
   * @param code - HTTP 状态码
   * @returns 是否为客户端错误
   */
  isClientError(code: number): boolean {
    return code >= 400 && code < 500;
  }

  /**
   * 检查状态码是否为服务器错误（5xx）
   * @param code - HTTP 状态码
   * @returns 是否为服务器错误
   */
  isServerError(code: number): boolean {
    return code >= 500 && code < 600;
  }
}

/** 导出默认实例，方便直接使用 */
export const responseHandler = new ResponseHandler();