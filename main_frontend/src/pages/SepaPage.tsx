import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SepaFormState {
  companyRcube: boolean;
  companyRcarre: boolean;
  iban: string;
  bic: string;
  paymentRecurring: boolean;
  paymentPunctual: boolean;
  debitAll: boolean;
  debitRecurring: boolean;
  placeOfSignature: string;
}

const SepaPage = () => {
  const { t } = useTranslation("common");

  const [form, setForm] = useState<SepaFormState>({
    companyRcube: false,
    companyRcarre: false,
    iban: "",
    bic: "",
    paymentRecurring: false,
    paymentPunctual: false,
    debitAll: false,
    debitRecurring: false,
    placeOfSignature: "",
  });

  const handleCheckbox = (field: keyof SepaFormState) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInput = (field: keyof SepaFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    // TODO: generate PDF mandate
  };

  return (
    <div className="flex-1 bg-background dark:bg-background-dark">
      <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">

        <h1 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
          {t("pages.sepa.title")}
        </h1>

        <p className="text-sm text-textSecondary dark:text-textSecondary-dark leading-relaxed">
          {t("pages.sepa.description")}
        </p>

        <div className="space-y-6">

          {/* Choose company */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.chooseCompany")}
            </span>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.companyRcube}
                  onChange={() => handleCheckbox("companyRcube")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-textPrimary dark:text-textPrimary-dark">Rcube</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.companyRcarre}
                  onChange={() => handleCheckbox("companyRcarre")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-textPrimary dark:text-textPrimary-dark">Rcarré</span>
              </label>
            </div>
          </div>

          {/* IBAN */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.iban")}
            </span>
            <input
              type="text"
              value={form.iban}
              onChange={(e) => handleInput("iban", e.target.value)}
              className="w-full max-w-sm border border-border dark:border-border-dark rounded px-3 py-2 text-sm bg-surface dark:bg-surface-dark text-textPrimary dark:text-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          {/* BIC */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.bic")}
            </span>
            <input
              type="text"
              value={form.bic}
              onChange={(e) => handleInput("bic", e.target.value)}
              className="w-full max-w-sm border border-border dark:border-border-dark rounded px-3 py-2 text-sm bg-surface dark:bg-surface-dark text-textPrimary dark:text-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

          {/* Payment Type */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.paymentType")}
            </span>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paymentRecurring}
                  onChange={() => handleCheckbox("paymentRecurring")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-secondary">{t("pages.sepa.paymentTypeRecurring")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paymentPunctual}
                  onChange={() => handleCheckbox("paymentPunctual")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-secondary">{t("pages.sepa.paymentTypePunctual")}</span>
              </label>
            </div>
          </div>

          {/* Type of debit */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.typeOfDebit")}
            </span>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.debitAll}
                  onChange={() => handleCheckbox("debitAll")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-secondary">{t("pages.sepa.typeDebitAll")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.debitRecurring}
                  onChange={() => handleCheckbox("debitRecurring")}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-secondary">{t("pages.sepa.typeDebitRecurring")}</span>
              </label>
            </div>
          </div>

          {/* Place of signature */}
          <div className="grid grid-cols-[280px_1fr] items-center gap-4">
            <span className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
              {t("pages.sepa.placeOfSignature")}
            </span>
            <input
              type="text"
              value={form.placeOfSignature}
              onChange={(e) => handleInput("placeOfSignature", e.target.value)}
              className="w-full max-w-sm border border-border dark:border-border-dark rounded px-3 py-2 text-sm bg-surface dark:bg-surface-dark text-textPrimary dark:text-textPrimary-dark focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>

        </div>

        {/* Footnote */}
        <p className="text-sm text-textSecondary dark:text-textSecondary-dark text-center">
          {t("pages.sepa.footnote")}
        </p>

        {/* Generate button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white text-sm font-bold tracking-wide rounded hover:bg-secondary/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t("pages.sepa.generate")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SepaPage;
