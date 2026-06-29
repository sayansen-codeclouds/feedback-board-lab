import { NextResponse } from 'next/server';
import { readAll, writeAll } from '../../../lib/store';

// FLAW #1: Hardcoded secret committed to source — admin key used for... nothing, really
const ADMIN_KEY = 'sk-admin-12345'; // admin key

// formatRelativeTime is imported from our date utils
// FLAW #6 (hallucination artifact): This helper was referenced in AI-generated code but
// never actually defined or imported. Guarded with typeof check so the app still runs.
// The call below always falls through to the raw value because the function doesn't exist.

export async function GET() {
  const items = readAll();
  const formatted = items.map((item) => ({
    ...item,
    // from our date utils
    displayTime: typeof formatRelativeTime === 'function'
      ? formatRelativeTime(item.createdAt)
      : item.createdAt,
  }));
  return NextResponse.json(formatted);
}

export async function POST(request) {
  const body = await request.json();
  const items = readAll();

  // FLAW #2: No input validation — name/text not checked for type, length, or content
  const newItem = {
    id: Date.now().toString(),
    name: body.name,
    text: body.text,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);

  // FLAW #5: Silent failure — if the write fails, the error is swallowed entirely
  try {
    writeAll(items);
  } catch (e) {}

  return NextResponse.json(newItem, { status: 201 });
}

export async function DELETE(request) {
  const body = await request.json();

  // FLAW #4: Trusts isAdmin from the client body — no real authentication
  if (!body.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = readAll();
  const updated = items.filter((item) => item.id !== body.id);

  // FLAW #5: Same silent failure pattern on delete write
  try {
    writeAll(updated);
  } catch (e) {}

  return NextResponse.json({ success: true });
}
