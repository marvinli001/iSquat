"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import PhotoUploadField from "@/components/PhotoUploadField";
import MapPicker from "@/components/MapPicker";
import { submitToilet } from "./actions";

type AddToiletFormProps = {
  districts: string[];
};

const initialState = { error: "" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn primary" type="submit" disabled={pending || disabled}>
      {pending ? "Submitting..." : "Submit for review"}
    </button>
  );
}

export default function AddToiletForm({ districts }: AddToiletFormProps) {
  const [state, formAction] = useFormState(submitToilet, initialState);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [uploadBusy, setUploadBusy] = useState(false);

  return (
    <form className="panel form-panel" action={formAction}>
      <h2>Submission form</h2>
      {state.error ? <div className="auth-error">{state.error}</div> : null}
      <div className="form-field">
        <label htmlFor="toilet-name">Toilet name</label>
        <input
          id="toilet-name"
          name="name"
          placeholder="e.g. Queen St Library WC"
          type="text"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="toilet-address">Address</label>
        <input
          id="toilet-address"
          name="address"
          placeholder="Street address or landmark"
          type="text"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="toilet-district">District</label>
        <select id="toilet-district" name="district" required>
          <option value="">Select a district</option>
          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>Pin on map</label>
        <MapPicker value={coords} onChange={setCoords} />
        <input name="lat" type="hidden" value={coords?.lat ?? ""} />
        <input name="lng" type="hidden" value={coords?.lng ?? ""} />
        <p className="form-note">
          Tap on the map to drop a pin near the entrance.
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="toilet-notes">Location notes (optional)</label>
        <textarea
          id="toilet-notes"
          name="notes"
          placeholder="Access code, opening hours, landmarks..."
          rows={4}
        />
      </div>
      <PhotoUploadField
        context="toilet_submission"
        prefix="toilets"
        onBusyChange={setUploadBusy}
      />
      <SubmitButton disabled={uploadBusy} />
      <p className="form-note">
        Submissions are reviewed before appearing on iSquat.
      </p>
    </form>
  );
}
