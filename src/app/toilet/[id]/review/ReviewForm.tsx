"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import PhotoUploadField from "@/components/PhotoUploadField";
import { submitReview } from "./actions";

type ReviewFormProps = {
  toiletId: string;
  toiletName: string;
};

const initialState = { error: "" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn primary" type="submit" disabled={pending || disabled}>
      {pending ? "Submitting..." : "Submit review"}
    </button>
  );
}

export default function ReviewForm({ toiletId, toiletName }: ReviewFormProps) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [uploadBusy, setUploadBusy] = useState(false);

  return (
    <form className="panel form-panel" action={formAction}>
      <h2>Review for {toiletName}</h2>
      {state.error ? <div className="auth-error">{state.error}</div> : null}
      <input type="hidden" name="toiletId" value={toiletId} />
      <div className="form-field">
        <label htmlFor="review-rating">Rating</label>
        <select id="review-rating" name="rating" required>
          <option value="">Choose a score</option>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Clean</option>
          <option value="3">3 - Okay</option>
          <option value="2">2 - Needs work</option>
          <option value="1">1 - Avoid</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="review-body">Notes (optional)</label>
        <textarea
          id="review-body"
          name="body"
          placeholder="What was clean? Any access notes?"
          rows={4}
        />
      </div>
      <PhotoUploadField
        context="review_photo"
        prefix="reviews"
        onBusyChange={setUploadBusy}
      />
      <SubmitButton disabled={uploadBusy} />
      <p className="form-note">
        Reviews and photos are moderated before they appear publicly.
      </p>
    </form>
  );
}
