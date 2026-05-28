declare module 'oauth-1.0a' {
  interface Token {
    key: string
    secret: string
  }

  interface RequestData {
    url: string
    method: string
    data?: Record<string, unknown>
  }

  interface OAuthOptions {
    consumer: Token
    signature_method: string
    hash_function: (baseString: string, key: string) => string
  }

  interface OAuthHeader {
    Authorization: string
    [key: string]: string
  }

  class OAuth {
    constructor(options: OAuthOptions)
    authorize(requestData: RequestData, token?: Token): Record<string, string>
    toHeader(oauthData: Record<string, string>): OAuthHeader
  }

  export = OAuth
}
