export type ContactPayload = {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const res = await fetch('http://localhost:5000/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
}

