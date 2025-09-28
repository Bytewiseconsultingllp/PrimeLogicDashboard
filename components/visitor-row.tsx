"use client"

import type React from "react"

import { useState } from "react"

type Visitor = {
  id?: string
  fullName?: string
  businessEmail?: string
  phoneNumber?: string | null
  companyName?: string | null
  companyWebsite?: string | null
  businessAddress?: string | null
  businessType?: string | null
  referralSource?: string | null
  createdAt?: string
  updatedAt?: string
}

export function VisitorRow({ visitor, index }: { visitor: Visitor; index: number }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [fullName, setFullName] = useState(visitor.fullName || "")
  const [businessEmail, setBusinessEmail] = useState(visitor.businessEmail || "")
  const [phoneNumber, setPhoneNumber] = useState(visitor.phoneNumber || "")
  const [companyName, setCompanyName] = useState(visitor.companyName || "")
  const [companyWebsite, setCompanyWebsite] = useState(visitor.companyWebsite || "")
  const [businessAddress, setBusinessAddress] = useState(visitor.businessAddress || "")
  const [businessType, setBusinessType] = useState(visitor.businessType || "")
  const [referralSource, setReferralSource] = useState(visitor.referralSource || "")

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!visitor.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/visitors/${visitor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          businessEmail,
          phoneNumber,
          companyName,
          companyWebsite,
          businessAddress,
          businessType,
          referralSource,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.success === false) {
        alert(`Update failed: ${json?.message || res.status}`)
      } else {
        setOpen(false)
        // Reload to re-render server component with latest data
        window.location.reload()
      }
    } catch (err: any) {
      alert(`Update error: ${err?.message || "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!visitor.id) return
    if (!confirm("Are you sure you want to delete this visitor?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/visitors/${visitor.id}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || json?.success === false) {
        alert(`Delete failed: ${json?.message || res.status}`)
      } else {
        // Reload to re-render server component with latest data
        window.location.reload()
      }
    } catch (err: any) {
      alert(`Delete error: ${err?.message || "Unknown error"}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <tr className="[&>td]:px-3 [&>td]:py-2 align-top">
        <td className="whitespace-pre-wrap">{visitor.fullName ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.businessEmail ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.phoneNumber ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.companyName ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.companyWebsite ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.businessAddress ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.businessType ?? "-"}</td>
        <td className="whitespace-pre-wrap">{visitor.referralSource ?? "-"}</td>
        <td className="whitespace-nowrap text-muted-foreground">
          {visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : "-"}
        </td>
        <td className="whitespace-nowrap">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="h-8 rounded-md border border-border bg-background px-3 text-xs text-foreground"
              aria-expanded={open}
              aria-controls={`edit-row-${index}`}
              disabled={!visitor.id}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="h-8 rounded-md bg-destructive px-3 text-xs text-destructive-foreground disabled:opacity-50"
              disabled={!visitor.id || deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={10} id={`edit-row-${index}`} className="px-3 pb-3">
            <form onSubmit={onSave} className="rounded-md border border-border bg-card p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Full Name</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Business Email</span>
                  <input
                    type="email"
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Phone Number</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={phoneNumber || ""}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Company Name</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={companyName || ""}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Company Website</span>
                  <input
                    type="url"
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={companyWebsite || ""}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs text-muted-foreground">Business Address</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={businessAddress || ""}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Business Type</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={businessType || ""}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Referral Source</span>
                  <input
                    className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none"
                    value={referralSource || ""}
                    onChange={(e) => setReferralSource(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="submit"
                  className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="h-9 rounded-md border border-border bg-background px-4 text-sm text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  )
}
