import { describe, expect, it } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../src'


const api = treaty(app)

describe('Elysia', () => {
  it('return a response', async () => {
    const { data } = await api.index.get()

    expect(data).toBe('Hello Elysia')
  })
})