import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 5)

export function generateClientId(): string {
  const year = new Date().getFullYear()
  return `LN-${nanoid()}-${year}`
}
