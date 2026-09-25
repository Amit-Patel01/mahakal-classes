'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckSquare, Plus, Clock, Award, BookOpen, AlertCircle, HelpCircle, X } from 'lucide-react';

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    courseId: '',
    subjectId: '',
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 40,
    negativeMarkingRate: 0.25,
    isPublished: true,
  });

  const [questionForm, setQuestionForm] = useState({
    title: '',
    explanation: '',
    marks: 4,
    negativeMarks: 1,
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/tests').then((res) => {
        if (res.success && res.data) setTests(res.data);
      }),
      api.get('/courses').then((res) => {
        if (res.success && res.data) {
          setCourses(res.data);
          if (res.data.length > 0 && !testForm.courseId) {
            setTestForm((prev) => ({
              ...prev,
              courseId: res.data[0].id || res.data[0]._id,
              subjectId: res.data[0].subjects?.[0]?.id || '',
            }));
          }
        }
      }),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await api.post('/tests', testForm);
    setSubmitting(false);

    if (res.success) {
      setCreateModalOpen(false);
      setTestForm({
        title: '',
        description: '',
        courseId: courses[0]?.id || courses[0]?._id || '',
        subjectId: courses[0]?.subjects?.[0]?.id || '',
        durationMinutes: 60,
        totalMarks: 100,
        passingMarks: 40,
        negativeMarkingRate: 0.25,
        isPublished: true,
      });
      loadData();
    } else {
      setError(res.message || 'Failed to create test');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;

    setError('');
    setSubmitting(true);

    const res = await api.post(`/tests/${selectedTest.id}/questions`, {
      type: 'SINGLE_CHOICE',
      title: questionForm.title,
      explanation: questionForm.explanation,
      marks: Number(questionForm.marks),
      negativeMarks: Number(questionForm.negativeMarks),
      options: questionForm.options,
    });
    setSubmitting(false);

    if (res.success) {
      setQuestionModalOpen(false);
      setQuestionForm({
        title: '',
        explanation: '',
        marks: 4,
        negativeMarks: 1,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
      loadData();
    } else {
      setError(res.message || 'Failed to add question');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Examination Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Online CBT Tests & Exams</h1>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading test series records...</div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-600 text-sm">No tests created yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Create New Test" to set up a mock exam.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {test.course?.code || 'CBT TEST'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        test.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{test.title}</h3>

                  {test.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{test.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.durationMinutes} Mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{test._count?.questions || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                      <span>Pass: {test.passingMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      setQuestionModalOpen(true);
                    }}
                    className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Test Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Online CBT Test</h3>
                <p className="text-xs text-slate-500">Configure exam duration, marks and batch</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Title *</label>
                <input
                  type="text"
                  required
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  placeholder="e.g. JEE Main Physics Full Syllabus Mock #1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Course / Batch *</label>
                <select
                  required
                  value={testForm.courseId}
                  onChange={(e) => {
                    const c = courses.find((x) => (x.id || x._id) === e.target.value);
                    setTestForm({
                      ...testForm,
                      courseId: e.target.value,
                      subjectId: c?.subjects?.[0]?.id || '',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.title || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    required
                    value={testForm.durationMinutes}
                    onChange={(e) =>
                      setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value, 10) || 60 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={testForm.totalMarks}
                    onChange={(e) =>
                      setTestForm({ ...testForm, totalMarks: parseFloat(e.target.value) || 100 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    required
                    value={testForm.passingMarks}
                    onChange={(e) =>
                      setTestForm({ ...testForm, passingMarks: parseFloat(e.target.value) || 40 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Syllabus</label>
                <textarea
                  rows={2}
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Includes Kinematics, Laws of Motion, and Work Power Energy..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={testForm.isPublished}
                  onChange={(e) => setTestForm({ ...testForm, isPublished: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="publishedCheck" className="font-semibold text-slate-700">
                  Publish test immediately for student attempts
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Creating...' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {questionModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Question to: {selectedTest.title}</h3>
                <p className="text-xs text-slate-500">Provide options and mark the correct answer</p>
              </div>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  placeholder="e.g. A particle moves in a circle of radius R with constant speed v. The acceleration is..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks (+)</label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseFloat(e.target.value) || 4 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Negative Marks (-)</label>
                  <input
                    type="number"
                    value={questionForm.negativeMarks}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, negativeMarks: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                <label className="block font-bold text-slate-700">Answer Options (Select the correct one):</label>
                {questionForm.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOpts = questionForm.options.map((o, i) => ({
                          ...o,
                          isCorrect: i === idx,
                        }));
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx].text = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Explanation (Optional)</label>
                <textarea
                  rows={2}
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Solution steps displayed to students after evaluation..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {submitting ? 'Saving Question...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
