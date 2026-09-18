import { formatDateForTitle } from "@/lib/utils/date-utils"

interface TitleProps {
    dateStr?: string | null
}

export default function Title({ dateStr }: TitleProps = {}){
    const date = formatDateForTitle(dateStr)
    return(
        <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-4xl">
                Estadísticas del día
            </h1>
            <p className="text-center text-sm text-primary/80">
                {date}
            </p>
        </div>
    )
}