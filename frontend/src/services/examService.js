import { mockExams } from '../data/mockData'

const EXAMS_KEY = 'studyspace_exams'

function getExams() {
  const stored = localStorage.getItem(EXAMS_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(EXAMS_KEY, JSON.stringify(mockExams))
  return mockExams
}

function saveExams(exams) {
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
}

export const examService = {
  async getByStudent(studentId) {
    await new Promise((r) => setTimeout(r, 200))
    return getExams()
      .filter((e) => e.studentId === studentId)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  },

  async create(data) {
    const exams = getExams()
    const exam = { id: `exam_${Date.now()}`, ...data }
    exams.push(exam)
    saveExams(exams)
    return exam
  },

  async remove(id) {
    const exams = getExams().filter((e) => e.id !== id)
    saveExams(exams)
  },
}
