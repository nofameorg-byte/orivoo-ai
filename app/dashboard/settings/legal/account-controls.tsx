"use client";

import { useState } from "react";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import {
  signOutAllSessions,
  softDeleteAccount,
} from "@/app/actions/account";

export function AccountControls() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  return (
    <section className="rounded-[2rem] border border-metal-red/25 bg-metal-red/10 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 size-5 shrink-0 text-metal-red-bright" />
        <div>
          <h2 className="text-xl font-semibold text-white">
            Account management
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Delete account is a soft-delete workflow. VP23 removes active user
            profile data where possible while retaining compliance, KYB,
            document, invoice, and review records where legally required.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-gold/40 sm:w-auto"
          >
            <LogOut className="size-4" aria-hidden />
            Logout
          </button>
        </form>
        <form action={signOutAllSessions}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-electric-blue/30 px-5 py-3 text-sm font-semibold text-electric-blue-bright transition hover:bg-electric-blue/10 sm:w-auto"
          >
            <LogOut className="size-4" aria-hidden />
            Sign Out All Sessions
          </button>
        </form>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-metal-red/40 px-5 py-3 text-sm font-semibold text-metal-red-bright transition hover:bg-metal-red/10 sm:w-auto"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete Account
        </button>
      </div>

      {deleteOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-[2rem] border border-metal-red/35 bg-panel p-6 shadow-2xl shadow-black/60">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 size-6 shrink-0 text-metal-red-bright" />
              <div>
                <h3
                  id="delete-account-title"
                  className="text-2xl font-semibold text-white"
                >
                  Delete VP23 account?
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  This soft-deletes active user records and signs you out of all
                  sessions. Compliance records are retained where legally
                  required. This action cannot be completed without typing
                  DELETE.
                </p>
              </div>
            </div>

            <form action={softDeleteAccount} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-white">
                  Type DELETE to confirm
                </span>
                <input
                  required
                  name="confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-metal-red/60"
                  placeholder="DELETE"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation("");
                    setDeleteOpen(false);
                  }}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmation !== "DELETE"}
                  className="rounded-full bg-metal-red px-5 py-3 text-sm font-semibold text-white transition hover:bg-metal-red-bright disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
