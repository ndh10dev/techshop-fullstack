export type ReviewDto = {
  id: number
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

//GET ALL REVIEWS (KHÔNG CÒN productId)
export async function fetchReviews(): Promise<ReviewDto[]> {
  const res = await fetch('http://localhost:5000/api/reviews')

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch (e) {
      void e
    }
    throw new Error(message)
  }

  return (await res.json()) as ReviewDto[]
}

//POST REVIEW (KHÔNG productId)
export async function submitReview(payload: {
  customerName: string
  rating: number
  comment: string
}): Promise<ReviewDto> {
  const res = await fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch (e) {
      void e
    }
    throw new Error(message)
  }

  return (await res.json()) as ReviewDto
}