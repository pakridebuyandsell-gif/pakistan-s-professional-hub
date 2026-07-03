import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { providersService } from "@/services/providers.service";
import { SERVICE_CATEGORIES, PK_CITIES } from "@/services/mock";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ImageUploader, UploadingOverlay } from "@/components/ImageUploader";
import { uploadsService } from "@/services/uploads.service";
import { z } from "zod";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/post-service")({
  head: () => ({
    meta: [
      { title: "Post a Service — WorqGo" },
      { name: "description", content: "Create a professional service listing on WorqGo and get more customers across Pakistan." },
      { property: "og:title", content: "Post a Service — WorqGo" },
      { property: "og:url", content: "/post-service" },
    ],
    links: [{ rel: "canonical", href: "/post-service" }],
  }),
  component: PostServiceGuarded,
});

function PostServiceGuarded() {
  return (
    <RequireAuth requiredRole="service_provider" action="service post">
      <PostServicePage />
    </RequireAuth>
  );
}

const STEPS = ["Service Details", "Pricing", "Gallery & Portfolio", "Review & Publish"];

function PostServicePage() {
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", category: "", subCategory: "", shortDesc: "", detailedDesc: "",
    city: "", travelToCustomer: true, workingDays: "", from: "", to: "",
    tags: "", rate: "", rateType: "hourly",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const update = (k: string, v: string | boolean | number) => setForm((f) => ({ ...f, [k]: v }));

  const stepSchemas = [
    z.object({
      title: z.string().trim().min(4, "Title must be at least 4 characters").max(120),
      category: z.string().min(1, "Select a category"),
      subCategory: z.string().trim().min(2, "Sub-category is required").max(80),
      shortDesc: z.string().trim().min(10, "Short description too short").max(160),
      detailedDesc: z.string().trim().min(30, "Please add at least 30 characters").max(2000),
      city: z.string().min(1, "Select a city"),
    }),
    z.object({
      rate: z.coerce.number().positive("Enter a valid rate"),
      rateType: z.enum(["hourly", "fixed", "daily"]),
    }),
    z.object({}),
    z.object({}),
  ] as const;

  const validateCurrent = () => {
    const result = stepSchemas[step].safeParse(form);
    if (!result.success) {
      const first = result.error.issues[0];
      toast.error(first?.message ?? "Please complete the required fields");
      return false;
    }
    return true;
  };

  const next = () => { if (validateCurrent()) setStep((s) => s + 1); };

  const submit = async () => {
    if (!user) { toast.error("Please login to post a service"); navigate({ to: "/auth/login" }); return; }
    for (const s of stepSchemas) {
      const r = s.safeParse(form);
      if (!r.success) { toast.error(r.error.issues[0].message); return; }
    }
    setBusy(true);
    try {
      let uploaded: Awaited<ReturnType<typeof uploadsService.uploadServiceImages>> = [];
      if (images.length) {
        try {
          uploaded = await uploadsService.uploadServiceImages(images);
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed; posting service without images", uploadErr);
          toast.warning("Image upload failed, service will be saved without images.");
        }
      }
      const mediaAssets = uploaded.map((u) => ({ url: u.url, publicId: u.publicId, account: "services" as const }));
      const payload: Record<string, unknown> = {
        ownerUid: user.uid,
        ownerEmail: user.email ?? "",
        name: form.title, category: form.category, city: form.city,
        description: form.detailedDesc,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        hourlyRate: Number(form.rate) || undefined, currency: "PKR",
        avatarUrl: uploaded[0]?.url,
        images: uploaded.map((u) => u.url),
        mediaAssets,
        subCategory: form.subCategory,
        shortDescription: form.shortDesc,
        rateType: form.rateType,
        workingDays: form.workingDays,
        hoursFrom: form.from,
        hoursTo: form.to,
        travelToCustomer: form.travelToCustomer,
      };
      const created = await providersService.create(payload as never);
      const { saveMyService } = await import("@/lib/local-store");
      saveMyService(user.uid, created);
      toast.success("Service posted successfully");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      const { newId, saveMyService } = await import("@/lib/local-store");
      saveMyService(user.uid, {
        id: newId(),
        ownerUid: user.uid,
        ownerEmail: user.email ?? "",
        name: form.title,
        category: form.category,
        city: form.city,
        description: form.detailedDesc,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        hourlyRate: Number(form.rate) || undefined,
        currency: "PKR",
        rating: 0,
        reviews: 0,
        level: "Bronze",
        verified: false,
        shortDescription: form.shortDesc,
        subCategory: form.subCategory,
        rateType: form.rateType,
        workingDays: form.workingDays,
        hoursFrom: form.from,
        hoursTo: form.to,
        travelToCustomer: form.travelToCustomer,
      });
      toast.success("Service posted successfully");
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="card-elevated overflow-hidden">
          <div className="bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] p-8 text-white">
            <h1 className="text-3xl font-bold md:text-4xl">Post Your Service</h1>
            <p className="mt-1 text-white/85">Create a professional listing and reach more customers.</p>
          </div>

          <div className="border-b border-border bg-white p-6">
            <ol className="flex flex-wrap items-center gap-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex flex-1 items-center gap-3 min-w-[150px]">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= step ? "bg-[var(--brand-orange)] text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                  <span className={`text-sm font-semibold ${i <= step ? "text-[var(--brand-orange)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < STEPS.length - 1 && <span className={`hidden h-px flex-1 md:block ${i < step ? "bg-[var(--brand-orange)]" : "bg-border"}`} />}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-6 bg-white p-6 md:grid-cols-[1fr_260px]">
            <div>
              {step === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Basic Information</h3>
                  <Field label="Service Title *"><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Professional Electrical Wiring" className="input" /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Category *">
                      <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
                        <option value="">Select category</option>
                        {SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Sub Category *"><input value={form.subCategory} onChange={(e) => update("subCategory", e.target.value)} className="input" /></Field>
                  </div>
                  <Field label="Short Description *"><textarea value={form.shortDesc} maxLength={160} onChange={(e) => update("shortDesc", e.target.value)} rows={2} className="input" /></Field>
                  <Field label="Detailed Description *"><textarea value={form.detailedDesc} maxLength={2000} onChange={(e) => update("detailedDesc", e.target.value)} rows={5} className="input" /></Field>
                  <Field label="Service Location *">
                    <select value={form.city} onChange={(e) => update("city", e.target.value)} className="input">
                      <option value="">Select city</option>
                      {PK_CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="flex gap-6 text-sm">
                    <label className="flex items-center gap-2"><input type="radio" checked={form.travelToCustomer} onChange={() => update("travelToCustomer", true)} /> I will travel to customer</label>
                    <label className="flex items-center gap-2"><input type="radio" checked={!form.travelToCustomer} onChange={() => update("travelToCustomer", false)} /> Customer will come to me</label>
                  </div>
                  <Field label="Tags / Skills"><input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. Wiring, Installation, Repair, Maintenance" className="input" /></Field>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Pricing & Availability</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Rate (PKR) *"><input type="number" value={form.rate} onChange={(e) => update("rate", e.target.value)} className="input" /></Field>
                    <Field label="Rate Type">
                      <select value={form.rateType} onChange={(e) => update("rateType", e.target.value)} className="input">
                        <option value="hourly">Per Hour</option><option value="fixed">Fixed Price</option><option value="daily">Per Day</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Working Days"><input value={form.workingDays} onChange={(e) => update("workingDays", e.target.value)} placeholder="e.g. Mon-Sat" className="input" /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="From"><input type="time" value={form.from} onChange={(e) => update("from", e.target.value)} className="input" /></Field>
                    <Field label="To"><input type="time" value={form.to} onChange={(e) => update("to", e.target.value)} className="input" /></Field>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Gallery & Portfolio</h3>
                  <p className="text-xs text-muted-foreground">
                    Add up to 4 photos of your previous work. Great photos double your conversion rate.
                  </p>
                  <ImageUploader value={images} onChange={setImages} max={4} />
                </div>
              )}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Review & Publish</h3>
                  <div className="rounded-xl border border-border p-4 text-sm">
                    <p><b>{form.title || "—"}</b> • {form.category || "—"}{form.subCategory ? ` · ${form.subCategory}` : ""}</p>
                    <p className="text-muted-foreground">{form.city}{form.workingDays ? ` · ${form.workingDays}` : ""}{form.from && form.to ? ` · ${form.from}–${form.to}` : ""}</p>
                    <p className="mt-2 text-[var(--brand-orange)] font-semibold">PKR {form.rate || "—"} / {form.rateType}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{form.detailedDesc}</p>
                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {images.map((f, i) => (
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
                  <Button onClick={next} className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">Save & Next</Button>
                ) : (
                  <Button onClick={submit} disabled={busy} className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-dark)] text-white">
                    {busy ? "Publishing…" : "Publish Service"}
                  </Button>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h4 className="mb-2 text-sm font-semibold">Tips for a Great Listing</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {["Choose the right category", "Write a clear description", "Add competitive pricing", "Upload real images", "Set availability correctly"].map((t) => <li key={t}>✓ {t}</li>)}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--brand-orange)]/20 bg-[var(--brand-orange)]/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-[var(--brand-orange)]">Why post on WorqGo?</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Get more local customers</li>
                  <li>• Build your professional brand</li>
                  <li>• Secure payments</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
      <UploadingOverlay active={busy} label="Publishing your service…" />
      <style>{`.input{width:100%;border:1px solid var(--color-input);background:white;border-radius:var(--radius-md);padding:0.65rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--brand-orange);box-shadow:0 0 0 3px oklch(0.7 0.19 47 / 0.15)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold">{label}</span>{children}</label>;
}
