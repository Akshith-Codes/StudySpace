import { mockIssues } from '../data/mockData'

const ISSUES_KEY = 'studyspace_issues'

function getIssues() {
  const stored = localStorage.getItem(ISSUES_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(ISSUES_KEY, JSON.stringify(mockIssues))
  return mockIssues
}

function saveIssues(issues) {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues))
}

export const issueService = {
  async getByStudent(studentId) {
    await new Promise((r) => setTimeout(r, 200))
    return getIssues()
      .filter((i) => i.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getAll() {
    await new Promise((r) => setTimeout(r, 200))
    return getIssues().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async create(data) {
    const issues = getIssues()
    const issue = {
      id: `iss_${Date.now()}`,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      ...data,
    }
    issues.push(issue)
    saveIssues(issues)
    return issue
  },

  async updateStatus(id, status) {
    const issues = getIssues()
    const idx = issues.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Issue not found')
    issues[idx].status = status
    if (status === 'Resolved') issues[idx].resolvedAt = new Date().toISOString()
    saveIssues(issues)
    return issues[idx]
  },
}
