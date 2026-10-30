"use client";

import { useActionState } from "react";

export default function FormUrutan({ id, urutan, action }) {
  const [state, formAction, pending] = useActionState(action, null);
  return <form action={formAction} className="flex items-center gap-1">
    <input type="hidden" name="id" value={id} />
    <label className="sr-only" htmlFor={`urutan-${id}`}>Urutan tampil</label>
    <input id={`urutan-${id}`} type="number" name="urutan" min="0" max="1000000" defaultValue={urutan || 0} className="w-20 rounded border border-garis bg-latar px-2 py-1" />
    <button disabled={pending} className="rounded border border-garis px-2 py-1 text-xs disabled:opacity-50">{pending ? "…" : "Atur"}</button>
    {state?.error && <span className="sr-only" role="alert">{state.error}</span>}
    {state?.sukses && <span className="sr-only" role="status">{state.sukses}</span>}
  </form>;
}
