const GRADIENTS = [
  "from-blue-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-pink-500",
  "from-fuchsia-500 to-indigo-500",
  "from-amber-500 to-rose-500",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-emerald-600",
  "from-rose-500 to-purple-600",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  const parts = (name || "?").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const sizeMap: Record<string, string> = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-2xl",
};

export function StartupLogo({
  name,
  url,
  size = "md",
  className = "",
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = sizeMap[size];
  const gradient = GRADIENTS[hash(name || "x") % GRADIENTS.length];
  return (
    <div
      className={`${dims} ${className} shrink-0 rounded-xl overflow-hidden border border-border flex items-center justify-center font-semibold text-white bg-gradient-to-br ${gradient}`}
    >
      {url ? (
        <img src={url} alt={`${name} logo`} className="w-full h-full object-cover" />
      ) : (
        <span className="font-mono">{initials(name)}</span>
      )}
    </div>
  );
}
