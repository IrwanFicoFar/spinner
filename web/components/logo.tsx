import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return <Link className="brand" href={href}><span>✳</span>spinora<i>.</i></Link>;
}
