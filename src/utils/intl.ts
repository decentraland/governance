export const numberFormat = Intl.NumberFormat('en', { notation: 'compact' })

type NestedMessages = {
  [key: string]: string | NestedMessages
}
// https://formatjs.io/docs/react-intl/upgrade-guide-2x/#flatten-messages-object
export function flattenMessages(nestedMessages: NestedMessages, prefix = ''): Record<string, string> {
  return Object.keys(nestedMessages).reduce((messages: Record<string, string>, key: string) => {
    const value = nestedMessages[key]
    const prefixedKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      messages[prefixedKey] = value
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey))
    }

    return messages
  }, {})
}
