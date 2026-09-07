'use client';

import { useState } from 'react';
import { useAdmin } from '../admin.hook';
import { AdminAccessGate } from './admin-access-gate';
import { AdminQuestionForm } from './admin-question-form';
import { AdminQuestionList } from './admin-question-list';

export function Admin() {
  const admin = useAdmin();
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);

  if (!admin.isAuthorized) {
    return (
      <AdminAccessGate
        email={admin.email}
        error={admin.error}
        isLoading={admin.isLoading}
        onEmailChange={admin.setEmail}
        onSubmit={(event) => {
          event.preventDefault();
          void admin.loadQuestions();
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 sm:p-8">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsQuestionBankOpen((current) => !current)}
            aria-expanded={isQuestionBankOpen}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:shadow-pink-500/30 active:scale-95"
          >
            คลังคำถาม
          </button>
        </div>
        <AdminQuestionForm
          editingId={admin.editingId}
          error={admin.error}
          form={admin.form}
          formError={admin.formError}
          isDuplicateLabel={admin.isDuplicateLabel}
          isLoading={admin.isLoading}
          onAddLabel={admin.addLabel}
          onAddOption={admin.addOption}
          onChange={admin.updateForm}
          onChangeLabelInput={admin.updateLabelInput}
          onChangeOption={admin.updateOption}
          onClear={admin.resetForm}
          onCorrectOptionChange={(id) => admin.updateForm('correctOptionId', id)}
          onRemoveLabel={admin.removeLabel}
          onRemoveOption={(index) => admin.updateForm('options', admin.form.options.filter((_, optionIndex) => optionIndex !== index))}
          onSubmit={admin.submit}
        />
        <AdminQuestionList
          isOpen={isQuestionBankOpen}
          isLoading={admin.isLoading}
          onEdit={admin.editQuestion}
          onClose={() => setIsQuestionBankOpen(false)}
          onRefresh={() => void admin.loadQuestions(admin.ADMIN_REFRESH_DELAY_MS)}
          onRemove={(id) => void admin.remove(id)}
          questions={admin.questions}
        />
      </section>
    </main>
  );
}
