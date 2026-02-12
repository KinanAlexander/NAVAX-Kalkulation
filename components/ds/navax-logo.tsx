import { cn } from "@/lib/utils"

interface NavaxLogoProps {
  className?: string
  variant?: "dark" | "light" | "brand"
  width?: number
}

const fills = {
  dark: "fill-foreground",
  light: "fill-white",
  brand: "fill-primary",
}

export function NavaxLogo({ className, variant = "dark", width = 140 }: NavaxLogoProps) {
  const aspectRatio = 202 / 35
  const height = width / aspectRatio

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 202 35"
      className={cn(fills[variant], className)}
      aria-label="NAVAX"
      role="img"
    >
      <g clipPath="url(#navax-clip)">
        <path d="M34.835 34.94h-3.5V3.502H12.197c-.884.005-8.697.307-8.697 8.698v22.737H0V12.204C0 2.552 7.976 0 12.196 0h22.639v34.94Zm114.906.06h-12.177c-9.646 0-12.196-7.981-12.196-12.204V12.199c0-4.223 2.55-12.204 12.196-12.204h10.427c4.235 0 12.211 2.552 12.211 12.204v22.776h-3.498V12.204c0-8.391-7.808-8.693-8.698-8.698h-10.442c-8.599 0-8.697 8.347-8.697 8.698v10.597c.005.885.306 8.698 8.697 8.698h12.177V35Zm-43.522-.015H83.58V.04h3.499v31.444h19.14c.884-.005 8.692-.306 8.692-8.698V.04h3.499v22.74c0 9.653-7.976 12.204-12.196 12.204h.005Zm83.59-31.469h12.196V.015h-12.196c-2.985 0-7.858 1.28-10.447 5.454-2.59-4.173-7.457-5.454-10.442-5.454h-1.75v3.5h1.75c.356 0 8.692.1 8.692 8.699v10.562c-.005.89-.306 8.703-8.692 8.703h-1.75v3.501h1.75c5.53 0 8.722-2.62 10.442-5.657 1.724 3.032 4.917 5.657 10.447 5.657H202l-.02-3.5h-12.176c-8.387 0-8.688-7.814-8.693-8.699V12.214c0-8.392 7.808-8.693 8.693-8.698h.005ZM66.16 35H53.984c-9.646 0-12.196-7.981-12.196-12.204V12.199c0-4.223 2.55-12.204 12.196-12.204H64.41c4.24 0 12.211 2.552 12.211 12.204v22.776h-3.499V12.204c0-8.391-7.808-8.693-8.697-8.698H53.984c-8.599 0-8.698 8.347-8.698 8.698v10.597c.005.885.307 8.698 8.698 8.698H66.16V35Z" />
      </g>
      <defs>
        <clipPath id="navax-clip">
          <path fill="#fff" d="M0 0h202v35H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}
