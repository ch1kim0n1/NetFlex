import Link from "next/link";

function Logo({ hover = true }) {
  return (
    <Link href="/">
      <div title="NetFlex" className={`text-netflix-red text-3xl font-black ${hover === true ? "hover:text-netflix-red/80" : ""} transition-all tracking-tight`}>NetFlex</div>
    </Link>
  );
}

export default Logo;