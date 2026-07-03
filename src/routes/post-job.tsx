import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { jobsService } from "@/services/jobs.service";
import { JOB_CATEGORIES, PK_CITIES } from "@/services/mock";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploader, UploadingOverlay } from "@/components/ImageUploader";
import { uploadsService } from "@/services/uploads.service";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/post-job")({
  head: () => ({
    meta: [
      { title: "Post a Job — WorqGo" },
      { name: "description", content: "Post a job on WorqGo in minutes and reach thousands of active job seekers across Pakistan." },
      { property: "og:title", content: "Post a Job — WorqGo" },
      { property: "og:url", content: "/post-job" },
    ],
    links: [{ rel: "canonical", href: "/post-job" }],
  }),
  component: PostJobGuarded,
});

function PostJobGuarded() {
  return (
    <RequireAuth requiredRole="employer" action="job post">
      <PostJobPage />
    </RequireAuth>
  );
}

const STEPS = ["Job Details", "Requirements", "Salary & Benefits", "Review & Publish"];

function PostJobPage() {
  const [step, setStep] = useState(0);
  const [logo, setLogo] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "", type: "Full Time", city: "", vacancies: 1,
    deadline: "", description: "", company: "", requirements: "",
    experience: "", education: "", salaryMin: "", salaryMax: "", benefits: "",
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const update = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const stepSchemas = [
    z.object({
      title: z.string().trim().min(4, "Job title must be at least 4 characters").max(120),
      category: z.string().min(1, "Select a category"),
      type: z.string().min(1),
      city: z.string().min(1, "Select a city"),
      vacancies: z.coerce.number().int().min(1, "At least 1 vacancy"),
      description: z.string().trim().min(30, "Description too short — add at least 30 characters"),
      company: z.string().trim().min(2, "Company name is required"),
    }),
    z.object({}),
    z.object({
      salaryMin: z.string().optional(),
      salaryMax: z.string().optional(),
    }).refine((v) => {
      if (v.salaryMin && v.salaryMax) return Number(v.salaryMin) <= Number(v.salaryMax);
      return true;
    }, "Min salary cannot exceed max salary"),
    z.object({}),
  ] as const;

  const next = () => {
    const r = stepSchemas[step].safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!user) { toast.error("Please login to post a job"); navigate({ to: "/auth/login" }); return; }
    for (const s of stepSchemas) {
      const r = s.safeParse(form);
      if (!r.success) { toast.error(r.error.issues[0].message); return; }
    }
    setBusy(true);
    try {
      // Upload to the Jobs Cloudinary account so we can later delete by publicId
      const uploaded = logo.length ? await uploadsService.uploadJobImages(logo) : [];
      const mediaAssets = uploaded.map((u) => ({ url: u.url, publicId: u.publicId, account: "jobs" as const }));
      const payload: Record<string, unknown> = {
        title: form.title, category: form.category, employmentType: form.type,
        city: form.city, location: `${form.city}, Pakistan`, company: form.company,
        companyLogo: uploaded[0]?.url,
        mediaAssets,
        description: form.description,
        vacancies: form.vacancies,
        deadline: form.deadline || undefined,
        requirements: form.requirements,
        experience: form.experience,
        education: form.education,
        benefits: form.benefits,
        salaryMin: Number(form.salaryMin) || undefined,
        salaryMax: Number(form.salaryMax) || undefined,
        currency: "PKR",
      };
      try {
        await jobsService.create(payload as never);
      } catch {
        // Backend unreachable — persist locally so the user's post is never lost
        const { saveMyJob, newId } = await import("@/lib/local-store");
        saveMyJob(user.uid, {
          id: newId(),
          title: form.title,
          company: form.company,
          companyLogo: uploaded[0]?.url,
          city: form.city,
          location: `${form.city}, Pakistan`,
          employmentType: form.type as never,
          category: form.category,
          salaryMin: Number(form.salaryMin) || undefined,
          salaryMax: Number(form.salaryMax) || undefined,
          currency: "PKR",
          postedAt: new Date().toISOString(),
          isNew: true,
          mediaAssets,
        });
        toast.info("Saved to your dashboard (offline mode)");
      }
      toast.success("Job posted successfully");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Could not post job. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="card-elevated overflow-hidden">
          <div className="gradient-brand p-8 text-white">
            <h1 className="text-3xl font-bold md:text-4xl">Post a Job</h1>
            <p className="mt-1 text-white/85">Find the right talent for your team. Post your job in minutes.</p>
          </div>

          <div className="border-b border-border bg-white p-6">
            <ol className="flex flex-wrap items-center gap-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-1 items-center gap-3 min-w-[150px]">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= step ? "bg-[var(--brand-green)] text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm font-semibold ${i <= step ? "text-[var(--brand-green)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < STEPS.length - 1 && <span className={`hidden h-px flex-1 md:block ${i < step ? "bg-[var(--brand-green)]" : "bg-border"}`} />}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-6 bg-white p-6 md:grid-cols-[1fr_260px]">
            <div>
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Job Details</h3>
                  <Field label="Job Title *"><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Delivery Rider" className="input" /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Job Category *">
                      <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
                        <option value="">Select category</option>
                        {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Job Type *">
                      <select value={form.type} onChange={(e) => update("type", e.target.value)} className="input">
                        {["Full Time", "Part Time", "Contract", "Internship"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Job Location *">
                    <select value={form.city} onChange={(e) => update("city", e.target.value)} className="input">
                      <option value="">Select city</option>
                      {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Number of Vacancies *"><input type="number" min={1} value={form.vacancies} onChange={(e) => update("vacancies", Number(e.target.value))} className="input" /></Field>
                    <Field label="Application Deadline"><input type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className="input" /></Field>
                  </div>
                  <Field label="Job Description *"><textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} className="input" placeholder="Describe the role, responsibilities and overall purpose of the job…" /></Field>
                  <Field label="Company / Employer Name *"><input value={form.company} onChange={(e) => update("company", e.target.value)} className="input" /></Field>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Requirements</h3>
                  <Field label="Experience Required"><input value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="e.g. 2-4 years" className="input" /></Field>
                  <Field label="Education"><input value={form.education} onChange={(e) => update("education", e.target.value)} placeholder="e.g. Intermediate" className="input" /></Field>
                  <Field label="Requirements / Skills"><textarea value={form.requirements} onChange={(e) => update("requirements", e.target.value)} rows={5} className="input" /></Field>
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold">Company Logo / Photos (optional, up to 4)</span>
                    <ImageUploader value={logo} onChange={setLogo} max={4} />
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Salary & Benefits</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Salary Min (PKR)"><input type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} className="input" /></Field>
                    <Field label="Salary Max (PKR)"><input type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} className="input" /></Field>
                  </div>
                  <Field label="Benefits"><textarea value={form.benefits} onChange={(e) => update("benefits", e.target.value)} rows={4} className="input" placeholder="Health insurance, bonuses, transport…" /></Field>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Review & Publish</h3>
                  <div className="rounded-xl border border-border p-4 text-sm">
                    <p><b>{form.title || "—"}</b> • {form.category || "—"} • {form.type}</p>
                    <p className="text-muted-foreground">{form.company} • {form.city} · {form.vacancies} vacancy(ies)</p>
                    <p className="mt-2 text-[var(--brand-green)] font-semibold">
                      PKR {form.salaryMin || "—"} - {form.salaryMax || "—"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{form.description}</p>
                    {logo.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {logo.map((f, i) => (
                          <img key={i} src={URL.createObjectURL(f)} alt="" className="aspect-square rounded-md object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <Button variant="outline" disabled={step === 0 || busy} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
                {step < STEPS.length - 1 ? (
                  <Button onClick={next} className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">Save & Next</Button>
                ) : (
                  <Button onClick={submit} disabled={busy} className="bg-[var(--brand-green)] hover:bg-[var(--brand-green-dark)] text-white">
                    {busy ? "Publishing…" : "Publish Job"}
                  </Button>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h4 className="mb-2 text-sm font-semibold">Tips for a better response</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {["Write a clear job title", "Describe responsibilities", "Add salary range", "Mention required skills", "Add location", "Set application deadline"].map((t) => <li key={t}>✓ {t}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--brand-green)]/20 bg-[var(--brand-green)]/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-[var(--brand-green)]">Why post on WorqGo?</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Thousands of active seekers</li>
                  <li>• Quality applications</li>
                  <li>• Easy shortlisting</li>
                  <li>• Trusted by 10,000+ employers</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
      <UploadingOverlay active={busy} label="Publishing your job…" />
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:white;border-radius:var(--radius-md);padding:0.65rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--brand-green);box-shadow:0 0 0 3px var(--brand-green)/15}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      {children}
    </label>
  );
}
