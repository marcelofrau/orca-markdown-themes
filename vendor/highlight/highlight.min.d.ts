declare const hljs: {
  registerLanguage(name: string, grammar: unknown): void
  getLanguage(name: string): unknown
  highlight(code: string, options: { language: string; ignoreIllegals?: boolean }): { value: string }
}
export default hljs
