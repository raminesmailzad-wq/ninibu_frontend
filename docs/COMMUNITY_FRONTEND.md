# Community frontend contract

Ninibu Frontend v0.3.0 consumes only the public authenticated community API surface from Backend v0.22.2.

## Client behavior

- Feed is paginated and can sort by latest or most helpful.
- Group list shows backend membership status; approval-required groups remain pending until moderated.
- Only active memberships are offered by the post composer.
- Anonymous publishing is explicit per post/comment; community-profile default is stored separately by the backend.
- Replies are limited to root comment + one reply level because the backend rejects deeper nesting.
- A verified clinician badge indicates verified professional identity only; it does not convert community content into an official consultation.
- Medical disclaimers and moderation-review status from the backend are shown to the user.
- Reports are moderation signals, not immediate client-side deletion.

## Privacy boundary

Community calls never include diagnosis, medication, allergy, vaccination, medical visit, treatment or private consultation data. Community identity/profile is separate from the private child health record.
