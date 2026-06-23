/**
 * 提交 API 测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { submitCode, pollSubmissionStatus } from '../submissions'
import { clearSubmissions } from '../mock/submissions'

describe('submitCode', () => {
  beforeEach(() => {
    clearSubmissions()
  })

  it('返回提交记录 ID', async () => {
    const res = await submitCode(1001, 'print("hello")', 'Python3')
    expect(res.code).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toMatch(/^SUB-/)
    expect(res.data.problemId).toBe(1001)
    expect(res.data.language).toBe('Python3')
    expect(res.data.status).toBe('PENDING')
  })

  it('不同提交生成不同 ID', async () => {
    const res1 = await submitCode(1001, 'a', 'C')
    const res2 = await submitCode(1001, 'b', 'C')
    expect(res1.data.id).not.toBe(res2.data.id)
  })

  it('记录代码内容', async () => {
    const code = '#include <stdio.h>\nint main() { return 0; }'
    const res = await submitCode(1001, code, 'C')
    expect(res.data.code).toBe(code)
  })
})

describe('pollSubmissionStatus', () => {
  beforeEach(() => {
    clearSubmissions()
  })

  it('返回 404 对于不存在的提交', async () => {
    const res = await pollSubmissionStatus('NONEXIST')
    expect(res.code).toBe(404)
  })

  it('第一次轮询返回 PENDING', async () => {
    const submit = await submitCode(1001, 'int main(){}', 'C++')
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.code).toBe(200)
    expect(res.data.status).toBe('PENDING')
  })

  it('多次轮询后进入 RUNNING', async () => {
    const submit = await submitCode(1001, 'int main(){}', 'C++')
    // 第一次 poll
    await pollSubmissionStatus(submit.data.id)
    // 第二次 poll 进入 RUNNING
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('RUNNING')
  })

  it('足够多次轮询后到达终态 (AC/WA/...)，不再变化', async () => {
    const submit = await submitCode(1001, 'int main(){}', 'C++')
    const statuses: string[] = []
    for (let i = 0; i < 10; i++) {
      const res = await pollSubmissionStatus(submit.data.id)
      statuses.push(res.data.status)
    }
    // 终态之后不应再变
    const finalStatus = statuses[statuses.length - 1]
    const finalStates = ['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'SE']
    expect(finalStates).toContain(finalStatus)
    // 检查终态之后保持稳定
    const lastFew = statuses.slice(-3)
    expect(new Set(lastFew).size).toBe(1)
  })

  it('空代码 → CE（@judge 钩子不适用时由 deterministicJudge 判定）', async () => {
    const submit = await submitCode(1001, '', 'C++')
    for (let i = 0; i < 10; i++) {
      await pollSubmissionStatus(submit.data.id)
    }
    // 空代码应该判定为 CE
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('CE')
  })

  it('// @judge: AC 钩子 → 终态为 AC', async () => {
    const submit = await submitCode(1001, '// @judge: AC\nint main(){}', 'C++')
    for (let i = 0; i < 10; i++) {
      await pollSubmissionStatus(submit.data.id)
    }
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('AC')
  })

  it('// @judge: WA 钩子 → 终态为 WA', async () => {
    const submit = await submitCode(1001, '// @judge: WA\nint main(){}', 'C++')
    for (let i = 0; i < 10; i++) {
      await pollSubmissionStatus(submit.data.id)
    }
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('WA')
  })

  it('while(true) → 判定为 TLE', async () => {
    const submit = await submitCode(1001, 'while(true) {}', 'C++')
    for (let i = 0; i < 10; i++) {
      await pollSubmissionStatus(submit.data.id)
    }
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('TLE')
  })

  it('#error → 判定为 CE', async () => {
    const submit = await submitCode(1001, '#error bad code', 'C')
    for (let i = 0; i < 10; i++) {
      await pollSubmissionStatus(submit.data.id)
    }
    const res = await pollSubmissionStatus(submit.data.id)
    expect(res.data.status).toBe('CE')
  })
})
