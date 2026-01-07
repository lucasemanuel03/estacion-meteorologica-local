import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-background p-4 shadow-md sticky top-0 z-50">
        <div className="mb-2 flex flex-col items-center justify-center">
          <Link href="/">
            <div className="flex gap-2">
              <img src="/EML-isotipo.svg" alt="Estación Meteorológica Local" className="h-12 w-12" />
              <h1 className="text-xl sm:text-4xl font-bold tracking-tight pt-2">Estación Meteorológica Local</h1>
            </div>
          </Link>
        </div>
    </header>
  )
}