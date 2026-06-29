import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readAll, writeAll } from '../../../lib/store';
import { formatRelativeTime } from '../../../lib/dateUtils';

const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  throw new Error('ADMIN_KEY environment variable is not set');
}

const feedbackSchema = z.object({
  name: z.string().min(1).max(100),
  text: z.string().min(1).max(2000),
});

export async function GET() {
  const items = readAll();
  const formatted = items.map((item) => ({
    ...item,
    displayTime: formatRelativeTime(item.createdAt),
  }));
  return NextResponse.json(formatted);
}

export async function POST(request) {
  const body = await request.json();

  const result = feedbackSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { name, text } = result.data;
  const items = readAll();
  const newItem = {
    id: Date.now().toString(),
    name,
    text,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);

  try {
    writeAll(items);
  } catch (e) {
    console.error('Failed to write feedback:', e);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }

  return NextResponse.json(newItem, { status: 201 });
}

export async function DELETE(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${ADMIN_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const items = readAll();
  const updated = items.filter((item) => item.id !== body.id);

  try {
    writeAll(updated);
  } catch (e) {
    console.error('Failed to delete feedback:', e);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
