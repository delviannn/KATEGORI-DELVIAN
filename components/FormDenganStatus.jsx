"use client";

import { useActionState } from "react";

export default function FormDenganStatus({ action, children, label = "Simpan", className = "flex flex-col gap-3", pendingLabel = "Menyimpan..." }) {
  const [state, formAction, pending] = useActionState(action, null);
  return <form action={formAction} className={className}>
    {children}
    <button type="submit" disabled={pending} className="inline-flex min-h-10 items-center justify-center self-start rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? pendingLabel : label}</button>
    {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state?.sukses && <p role="status" className="text-sm text-emerald-700">{state.sukses}</p>}
  </form>;
}
