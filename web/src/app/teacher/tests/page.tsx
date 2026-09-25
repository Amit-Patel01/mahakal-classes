'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckSquare, Plus, PlusCircle, Check, AlertCircle, HelpCircle } from 'lucide-react';

export default function TeacherTestsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');

  // New Test Form State
  const [testForm, setTestForm] = useState({
    courseId: '',
    subjectId: '',
    title: '',
    durationMinutes: 60,
    totalMarks: 40,
    passingMarks: 16,
    negativeMarkingRate: 0.25,
    instructions: 'Negative marking applies. Read each problem carefully.',
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    type: 'SINGLE_CHOICE',
    marks: 4,
    negativeMarks: 1,
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  });

  const [testMsg, setTestMsg] = useState('');
  const [questionMsg, setQuestionMsg] = useState('');

  const loadData = () => {
    api.get('/courses').then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
        if (!testForm.courseId) {
          const firstCourse = res.data[0];
          const firstCourseId = firstCourse?.id || firstCourse?._id?.toString() || '';
          const firstSub = firstCourse?.subjects?.[0];
          const firstSubId = firstSub?.id || firstSub?._id?.toString() || '';
          setTestForm((prev) => ({
            ...prev,
            courseId: firstCourseId,
            subjectId: firstSubId,
          }));
        }
      }
    });

    api.get('/tests').then((res) => {
      if (res.success && res.data) {
        setTests(res.data);
        if (res.data.length > 0 && !selectedTestId) {
          setSelectedTestId(res.data[0].id);
        }
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestMsg('');

    const res = await api.post('/tests', {
      ...testForm,
      isPublished: true,
    });

    if (res.success && res.data) {
      setTestMsg('Test created successfully! You can now add questions below.');
      setSelectedTestId(res.data.id);
      loadData();
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) {
      alert('Please select or create a test first.');
      return;
    }

    setQuestionMsg('');

    const res = await api.post(`/tests/${selectedTestId}/questions`, questionForm);

    if (res.success) {
      setQuestionMsg('Question and options added successfully to the test paper!');
      setQuestionForm({
        questionText: '',
        type: 'SINGLE_CHOICE',
        marks: 4,
        negativeMarks: 1,
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      });
      loadData();
    }
  };

  const updateOptionText = (index: number, text: string) => {
    const updated = [...questionForm.options];
    updated[index].optionText = text;
    setQuestionForm({ ...questionForm, options: updated });
  };

  const updateOptionCorrect = (index: number) => {
    const updated = questionForm.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setQuestionForm({ ...questionForm, options: updated });
  };

  const selectedCourse = courses.find((c) => c.id === testForm.courseId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
          Online Examination Portal
        </span>
        <h1 className="text-2xl font-extrabold text-navy-950 mt-1">
          Create Tests & Question Bank
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CREATE TEST FORM */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span>1. Create Online Examination Paper</span>
          </h3>

          {testMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
              <Check className="w-4 h-4" />
              <span>{testMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateTest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course</label>
                <select
                  value={testForm.courseId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const found = courses.find((c) => c.id === cId);
                    setTestForm((prev) => ({
                      ...prev,
                      courseId: cId,
                      subjectId: found?.subjects?.[0]?.id || '',
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                <select
                  value={testForm.subjectId}
                  onChange={(e) => setTestForm({ ...testForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {selectedCourse?.subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Title</label>
              <input
                type="text"
                required
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                placeholder="e.g. JEE Advanced Full Mock Test 02"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (m)</label>
                <input
                  type="number"
                  value={testForm.durationMinutes}
                  onChange={(e) =>
                    setTestForm({ ...testForm, durationMinutes: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Marks</label>
                <input
                  type="number"
                  value={testForm.totalMarks}
                  onChange={(e) =>
                    setTestForm({ ...testForm, totalMarks: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Neg Rate</label>
                <input
                  type="number"
                  step="0.05"
                  value={testForm.negativeMarkingRate}
                  onChange={(e) =>
                    setTestForm({ ...testForm, negativeMarkingRate: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md w-full"
            >
              Create Examination Paper
            </button>
          </form>
        </div>

        {/* QUESTION BUILDER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>2. Add Questions & Answers</span>
          </h3>

          {questionMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
              <Check className="w-4 h-4" />
              <span>{questionMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Test</label>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.totalQuestions || 0} Qs)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Text</label>
              <textarea
                required
                rows={3}
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                placeholder="Enter question statement, formula or numerical problem..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Options (Click circle to set Correct Answer)
              </label>
              {questionForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => updateOptionCorrect(i)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    required
                    value={opt.optionText}
                    onChange={(e) => updateOptionText(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Faculty Step-by-Step Explanation
              </label>
              <textarea
                rows={2}
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain the derivation/shortcut so students can learn in their scorecard..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question to Test Paper</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
