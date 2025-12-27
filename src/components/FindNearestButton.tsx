import Link from "next/link";

type FindNearestButtonProps = {
  className?: string;
  label?: string;
  href?: string;
};

export default function FindNearestButton({
  className = "btn ghost",
  label = "Find nearest",
  href = "/nearby",
}: FindNearestButtonProps) {
  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
