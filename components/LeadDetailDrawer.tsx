"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  BadgeCheck,
  Briefcase,
  Tag,
} from "lucide-react";

function Linkedin({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import {
  Lead,
  STATUS_LABEL,
  SOURCE_LABEL,
  FUNNEL_LABEL,
} from "@/lib/leads-vicky-v1";

export function LeadDetailDrawer({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  // Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (lead) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-mhsp-navy/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            role="dialog"
            aria-label={`Lead detail — ${lead.fullName}`}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white border-l border-mhsp-line shadow-[0_0_60px_-10px_rgba(15,76,129,0.35)] flex flex-col"
          >
            {/* Header */}
            <header
              className={`px-5 py-4 border-b border-mhsp-line shrink-0 ${
                lead.funnel === "calculated"
                  ? "bg-mhsp-navy/5"
                  : "bg-mhsp-teal/8"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                    lead.funnel === "calculated"
                      ? "bg-mhsp-navy"
                      : "bg-mhsp-teal"
                  }`}
                >
                  {(lead.firstName?.[0] ?? "") + (lead.lastName?.[0] ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg text-mhsp-navy leading-tight truncate">
                    {lead.fullName}
                  </h2>
                  <p className="text-sm text-mhsp-muted truncate">
                    {lead.title}
                    {lead.companyName ? ` · ${lead.companyName}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Pill className={STATUS_LABEL[lead.status].color}>
                      {STATUS_LABEL[lead.status].label}
                    </Pill>
                    <Pill className="bg-white border-mhsp-line text-mhsp-muted">
                      {FUNNEL_LABEL[lead.funnel]}
                    </Pill>
                    <Pill className="bg-white border-mhsp-line text-mhsp-muted">
                      {SOURCE_LABEL[lead.source]}
                    </Pill>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 rounded-md text-mhsp-muted hover:text-mhsp-navy hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Why they fit */}
              {lead.whyTheyFit && (
                <Section title="Why they fit">
                  <p className="text-sm text-mhsp-text leading-relaxed">
                    {lead.whyTheyFit}
                  </p>
                  {(lead.estAnnualRoomNights || lead.bestFirstTouch) && (
                    <div className="mt-2 pt-2 border-t border-mhsp-line/60 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {lead.estAnnualRoomNights && (
                        <span className="text-mhsp-muted">
                          Est. RNs/yr:{" "}
                          <span className="font-numeric font-semibold text-mhsp-navy">
                            {lead.estAnnualRoomNights.toLocaleString()}
                          </span>
                        </span>
                      )}
                      {lead.bestFirstTouch && (
                        <span className="text-mhsp-muted">
                          First touch:{" "}
                          <span className="font-medium text-mhsp-navy">
                            {lead.bestFirstTouch}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </Section>
              )}

              {/* Personal */}
              <Section title="Personal">
                <Field label="Full name" value={lead.fullName} />
                <Field label="Title" value={lead.title} />
                {lead.department && (
                  <Field label="Department" value={lead.department} />
                )}
                {lead.seniority && (
                  <Field label="Seniority" value={lead.seniority} />
                )}
              </Section>

              {/* Company */}
              <Section title="Company">
                <Field
                  icon={<Building2 className="h-3.5 w-3.5" />}
                  label="Company"
                  value={lead.companyName}
                />
                {lead.industry && (
                  <Field label="Industry" value={lead.industry} />
                )}
                {lead.companySize && (
                  <Field label="Company size" value={lead.companySize} />
                )}
                {lead.companyWebsite && (
                  <Field
                    icon={<Globe className="h-3.5 w-3.5" />}
                    label="Website"
                    value={
                      <a
                        href={lead.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mhsp-teal underline underline-offset-2 break-all"
                      >
                        {lead.companyWebsite}
                      </a>
                    }
                  />
                )}
                {lead.companyLinkedinUrl && (
                  <Field
                    icon={<Linkedin className="h-3.5 w-3.5" />}
                    label="Company LinkedIn"
                    value={
                      <a
                        href={lead.companyLinkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mhsp-teal underline underline-offset-2 break-all"
                      >
                        {lead.companyLinkedinUrl}
                      </a>
                    }
                  />
                )}
              </Section>

              {/* Contact */}
              <Section title="Contact">
                <Field
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Email"
                  value={
                    <span className="flex items-center gap-2">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-mhsp-teal underline underline-offset-2 break-all"
                      >
                        {lead.email}
                      </a>
                      {lead.emailStatus === "verified" && (
                        <BadgeCheck className="h-3.5 w-3.5 text-mhsp-success shrink-0" />
                      )}
                    </span>
                  }
                />
                <Field
                  label="Email status"
                  value={
                    <Pill
                      className={
                        lead.emailStatus === "verified"
                          ? "bg-mhsp-success/10 text-mhsp-success border-mhsp-success/30"
                          : "bg-mhsp-cream-warm text-mhsp-muted border-mhsp-line"
                      }
                    >
                      {lead.emailStatus}
                    </Pill>
                  }
                />
                {lead.mobilePhone && (
                  <Field
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Mobile"
                    value={
                      <a
                        href={`tel:${lead.mobilePhone}`}
                        className="text-mhsp-navy hover:text-mhsp-gold transition-colors"
                      >
                        {lead.mobilePhone}
                      </a>
                    }
                  />
                )}
                {lead.workPhone && (
                  <Field
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Work phone"
                    value={
                      <a
                        href={`tel:${lead.workPhone}`}
                        className="text-mhsp-navy hover:text-mhsp-gold transition-colors"
                      >
                        {lead.workPhone}
                      </a>
                    }
                  />
                )}
                {lead.linkedinUrl && (
                  <Field
                    icon={<Linkedin className="h-3.5 w-3.5" />}
                    label="LinkedIn"
                    value={
                      <a
                        href={lead.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mhsp-teal underline underline-offset-2 break-all"
                      >
                        {lead.linkedinUrl}
                      </a>
                    }
                  />
                )}
                {lead.location && (
                  <Field
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Location"
                    value={lead.location}
                  />
                )}
              </Section>

              {/* Background */}
              {(lead.yearsExperience ||
                (lead.skills && lead.skills.length > 0) ||
                lead.summary) && (
                <Section title="Background">
                  {lead.yearsExperience !== undefined && (
                    <Field
                      icon={<Briefcase className="h-3.5 w-3.5" />}
                      label="Experience"
                      value={`${lead.yearsExperience}+ years`}
                    />
                  )}
                  {lead.summary && (
                    <Field
                      label="Summary"
                      value={
                        <p className="text-sm text-mhsp-text leading-relaxed">
                          {lead.summary}
                        </p>
                      }
                    />
                  )}
                  {lead.skills && lead.skills.length > 0 && (
                    <Field
                      label="Skills"
                      value={
                        <div className="flex flex-wrap gap-1.5">
                          {lead.skills.map((s) => (
                            <Pill
                              key={s}
                              className="bg-mhsp-cream-warm text-mhsp-navy border-mhsp-line"
                            >
                              {s}
                            </Pill>
                          ))}
                        </div>
                      }
                    />
                  )}
                </Section>
              )}

              {/* Tags */}
              {lead.tags.length > 0 && (
                <Section title="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((t) => (
                      <Pill
                        key={t}
                        className="bg-mhsp-gold/10 text-mhsp-navy border-mhsp-gold/30"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1 inline" />
                        {t}
                      </Pill>
                    ))}
                  </div>
                </Section>
              )}

              {/* Notes */}
              {lead.notes && (
                <Section title="Notes">
                  <p className="text-sm text-mhsp-text leading-relaxed whitespace-pre-wrap">
                    {lead.notes}
                  </p>
                </Section>
              )}

              {/* Meta */}
              <div className="pt-4 border-t border-mhsp-line text-[11px] text-mhsp-muted/80 space-y-0.5 font-numeric">
                <p>
                  Added {new Date(lead.createdAt).toLocaleString()}
                </p>
                <p>
                  Updated {new Date(lead.updatedAt).toLocaleString()}
                </p>
                <p>ID: {lead.id}</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-mhsp-gold mb-2.5">
        {title}
      </p>
      <div className="bg-mhsp-cream-warm/30 border border-mhsp-line/60 rounded-xl p-3 space-y-2">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon && <span className="text-mhsp-muted">{icon}</span>}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-mhsp-muted">
          {label}
        </p>
      </div>
      <div className="text-sm text-mhsp-navy font-medium leading-snug">
        {value}
      </div>
    </div>
  );
}

function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5 ${className}`}
    >
      {children}
    </span>
  );
}
