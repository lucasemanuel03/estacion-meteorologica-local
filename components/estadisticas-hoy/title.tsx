export default function Title(){
    const date = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    return(
        <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-center md:text-4xl">
                Estadísticas del día
            </h1>
            <p className="text-center text-sm text-primary/80">
                {date.toUpperCase()}
            </p>
        </div>
    )
}