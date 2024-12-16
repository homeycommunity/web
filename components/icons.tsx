import {
  Download,
  Loader2,
  LucideProps,
  Moon,
  SunMedium,
  Twitter,
  type LucideIcon,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  sun: SunMedium,
  moon: Moon,
  twitter: Twitter,
  spinner: Loader2,
  download: Download,
  logo: (props: LucideProps) => (
    <svg
      width="48px"
      height="48px"
      viewBox="0 0 48 48"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          id="linearGradient-1"
        >
          <stop stopColor="#31F500" offset="0%"></stop>
          <stop stopColor="#00FFE0" offset="14.4777098%"></stop>
          <stop stopColor="#002CFF" offset="32.049978%"></stop>
          <stop stopColor="#FF00E2" offset="49.26691%"></stop>
          <stop stopColor="#FF0000" offset="66.3133741%"></stop>
          <stop stopColor="#FFEE00" offset="82.7305507%"></stop>
          <stop stopColor="#31F500" offset="100%"></stop>
        </linearGradient>
        <linearGradient
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
          id="linearGradient-2"
        >
          <stop stopColor="#FFFFFF" stopOpacity="0.5" offset="0%"></stop>
          <stop stopColor="#FFFFFF" stopOpacity="0.5" offset="100%"></stop>
        </linearGradient>
        <path
          d="M24,0 C37.2548333,0 48,10.7451653 48,24 C48,37.2548333 37.2548333,48 24,48 C10.7451653,48 0,37.2548333 0,24 C0,10.7451653 10.7451653,0 24,0 Z M23.9999955,9.600037 C16.0470955,9.600037 9.599997,16.0471368 9.599997,24.0000385 C9.599997,31.9529393 16.0470955,38.40004 23.9999955,38.40004 C31.9528946,38.40004 38.399994,31.9529393 38.399994,24.0000385 C38.399994,16.0471368 31.9528946,9.600037 23.9999955,9.600037 Z"
          id="path-3"
        ></path>
      </defs>
      <g
        id="Frame"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
      >
        <g id="Oval-Subtract">
          <use fill="url(#linearGradient-1)" href="#path-3"></use>
          <use fill="url(#linearGradient-2)" href="#path-3"></use>
        </g>
      </g>
    </svg>
  ),
  gitHub: (props: LucideProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
        fill="currentColor"
      />
    </svg>
  ),
  discord: (props: LucideProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.03.02.03.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.02.03.05.03.07.02 1.72-.53 3.45-1.33 5.24-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"
        fill="currentColor"
      />
    </svg>
  ),
}
