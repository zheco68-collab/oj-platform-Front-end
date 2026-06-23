/**
 * JudgeStatusCard 组件测试
 */
import { describe, it, expect } from 'vitest'
import { mountWithPlugins } from '../../test/helpers'
import JudgeStatusCard from '../JudgeStatusCard.vue'

function mountCard(props: Record<string, unknown> = {}) {
  return mountWithPlugins(JudgeStatusCard, {
    props: { status: 'AC', ...props },
  })
}

describe('JudgeStatusCard', () => {
  it('渲染 AC 状态标签', () => {
    const wrapper = mountCard({ status: 'AC' })
    expect(wrapper.text()).toContain('Accepted')
  })

  it('渲染 WA 状态标签', () => {
    const wrapper = mountCard({ status: 'WA' })
    expect(wrapper.text()).toContain('Wrong Answer')
  })

  it('渲染 TLE 状态标签', () => {
    const wrapper = mountCard({ status: 'TLE' })
    expect(wrapper.text()).toContain('Time Limit Exceeded')
  })

  it('渲染 PENDING 状态标签', () => {
    const wrapper = mountCard({ status: 'PENDING' })
    expect(wrapper.text()).toContain('等待中')
  })

  it('渲染 RUNNING 状态标签', () => {
    const wrapper = mountCard({ status: 'RUNNING' })
    expect(wrapper.text()).toContain('判题中')
  })

  it('RUNNING 时显示 loading 提示', () => {
    const wrapper = mountCard({ status: 'RUNNING', loading: true })
    expect(wrapper.text()).toContain('判题中，请稍候')
  })

  it('PENDING 时显示等待提示', () => {
    const wrapper = mountCard({ status: 'PENDING' })
    expect(wrapper.text()).toContain('判题中，请稍候')
  })

  it('AC 时显示运行时间和内存', () => {
    const wrapper = mountCard({ status: 'AC', time: 42, memory: 10240 })
    const text = wrapper.text()
    expect(text).toContain('运行时间')
    expect(text).toContain('42 ms')
    expect(text).toContain('内存消耗')
    expect(text).toContain('10.0 MB')
  })

  it('AC 时不显示 loading 提示', () => {
    const wrapper = mountCard({ status: 'AC' })
    expect(wrapper.text()).not.toContain('判题中，请稍候')
  })

  it('CE 时显示编译错误提示', () => {
    const wrapper = mountCard({ status: 'CE' })
    expect(wrapper.text()).toContain('Compile Error')
    expect(wrapper.text()).toContain('编译失败')
  })

  it('SE 时显示系统错误提示', () => {
    const wrapper = mountCard({ status: 'SE' })
    expect(wrapper.text()).toContain('System Error')
    expect(wrapper.text()).toContain('重试')
  })

  it('CE 时不显示运行时间和内存', () => {
    const wrapper = mountCard({ status: 'CE', time: 100, memory: 2048 })
    expect(wrapper.text()).not.toContain('运行时间')
  })

  it('错误信息显示', () => {
    const wrapper = mountCard({ status: 'WA', error: '提交失败' })
    expect(wrapper.text()).toContain('提交失败')
  })

  it('渲染所有终态标签', () => {
    const finalStates = [
      { status: 'AC', label: 'Accepted' },
      { status: 'WA', label: 'Wrong Answer' },
      { status: 'TLE', label: 'Time Limit Exceeded' },
      { status: 'MLE', label: 'Memory Limit Exceeded' },
      { status: 'RE', label: 'Runtime Error' },
      { status: 'CE', label: 'Compile Error' },
      { status: 'SE', label: 'System Error' },
    ]
    for (const { status, label } of finalStates) {
      const wrapper = mountCard({ status })
      expect(wrapper.text()).toContain(label)
    }
  })

  it('formatTime 格式化运行时间：小于 1000ms 显示 ms', () => {
    const wrapper = mountCard({ status: 'AC', time: 500, memory: 10240 })
    expect(wrapper.text()).toContain('500 ms')
  })

  it('formatTime 格式化运行时间：>= 1000ms 显示为秒', () => {
    const wrapper = mountCard({ status: 'AC', time: 1500, memory: 10240 })
    expect(wrapper.text()).toContain('2 s')
  })

  it('formatMemory 格式化内存：KB 转 MB', () => {
    const wrapper = mountCard({ status: 'AC', time: 10, memory: 2048 })
    expect(wrapper.text()).toContain('2.0 MB')
  })
})
