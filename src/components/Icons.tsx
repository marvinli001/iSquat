import { useId } from "react";

type IconProps = {
  className?: string;
};

export function StarIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.7-5.2 2.7 1-5.9-4.3-4.2 5.9-.9L12 3.5z"
        fill="currentColor"
        stroke="rgba(26, 19, 15, 0.45)"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 2.5c-3.6 0-6.5 2.9-6.5 6.5 0 4.8 6.5 12 6.5 12s6.5-7.2 6.5-12c0-3.6-2.9-6.5-6.5-6.5zm0 9.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AppleLogoIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 7.1c2.7 0 4.9 2.2 4.9 4.9 0 3.7-2.4 7.3-4.9 7.3S7.1 15.7 7.1 12c0-2.7 2.2-4.9 4.9-4.9z"
        fill="currentColor"
      />
      <path
        d="M14.6 3.9c.6-.7 1.6-1.3 2.6-1.4-.1 1-.5 2.1-1.2 2.8-.6.7-1.7 1.2-2.7 1.2.1-.9.6-1.9 1.3-2.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GoogleMapsIcon({ className }: IconProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
    >
      <defs>
        <linearGradient
          id={`${gradientId}-pin`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#34a853" />
          <stop offset="45%" stopColor="#fbbc05" />
          <stop offset="70%" stopColor="#ea4335" />
          <stop offset="100%" stopColor="#4285f4" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.4c-3.6 0-6.6 2.9-6.6 6.6 0 5.2 6.6 12.6 6.6 12.6s6.6-7.4 6.6-12.6c0-3.7-3-6.6-6.6-6.6z"
        fill={`url(#${gradientId}-pin)`}
      />
      <circle cx="12" cy="9" r="2.5" fill="#ffffff" />
    </svg>
  );
}
