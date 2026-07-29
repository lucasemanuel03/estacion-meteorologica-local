'use client'

import * as React from 'react'
import { AlertCircle, Clock3, Database, Loader2, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type RainEvent = {
  id: string
  recorded_at: string
  created_at?: string
  is_offline: boolean
}

type RainEventsResponse = {
  date: string
  count: number
  events: RainEvent[]
  timestamp: string
}

type DeleteRainEventsResponse = {
  success: boolean
  date: string
  deleted: number
  timestamp: string
}

const storageKey = 'local-weather-station:rain-events-api-key'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
  }).format(new Date(`${value}T12:00:00`))
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}

export default function Page() {
  const [apiKey, setApiKey] = React.useState('')
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(false)
  const [isDeletingEvents, setIsDeletingEvents] = React.useState(false)
  const [eventsResponse, setEventsResponse] = React.useState<RainEventsResponse | null>(null)
  const [deleteResponse, setDeleteResponse] = React.useState<DeleteRainEventsResponse | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setApiKey(window.localStorage.getItem(storageKey) ?? '')
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, apiKey)
  }, [apiKey])

  async function fetchRainEvents() {
    setErrorMessage(null)
    setDeleteResponse(null)
    setIsLoadingEvents(true)

    try {
      const response = await fetch('/api/rain-events', { method: 'GET' })
      const data = (await response.json()) as RainEventsResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudieron cargar los registros de lluvia')
      }

      setEventsResponse(data)
      setIsDialogOpen(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los registros de lluvia')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  async function deleteTodayRainEvents() {
    if (!apiKey.trim()) {
      setErrorMessage('Ingresa una API key antes de borrar los registros de lluvia de hoy.')
      return
    }

    const confirmed = window.confirm(
      '¿Quieres borrar definitivamente los registros de lluvia de hoy? Esta acción no se puede deshacer.',
    )

    if (!confirmed) {
      return
    }

    setErrorMessage(null)
    setIsDeletingEvents(true)

    try {
      const response = await fetch('/api/rain-events', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
      })
      const data = (await response.json()) as DeleteRainEventsResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'No se pudieron borrar los registros de lluvia de hoy')
      }

      setDeleteResponse(data)
      setEventsResponse(null)
      setIsDialogOpen(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron borrar los registros de lluvia de hoy')
    } finally {
      setIsDeletingEvents(false)
    }
  }

  const eventCount = eventsResponse?.count ?? 0

  return (
    <PageShell>
      <section className="glass-card relative overflow-hidden border-border/60 bg-card/70 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_35%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                zona de pruebas
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                lluvia
              </Badge>
            </div>

            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                Consola de prueba para los eventos de lluvia.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Revisa los registros del día en una tabla dentro de un diálogo y elimina los datos de hoy con el endpoint protegido.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5">
                <Clock3 className="size-4" />
                GET /api/rain-events
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5">
                <ShieldAlert className="size-4" />
                DELETE /api/rain-events
              </span>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
            <div>
              <Label htmlFor="api-key" className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                API key para borrar
              </Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Bearer token para DELETE"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Database className="size-4" />
                  Registros visibles
                </div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{eventCount}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
                <div className="flex items-center gap-2 text-foreground">
                  <RefreshCw className="size-4" />
                  Última respuesta
                </div>
                <div className="mt-1 text-xs leading-5">
                  {eventsResponse ? formatDateTime(eventsResponse.timestamp) : deleteResponse ? formatDateTime(deleteResponse.timestamp) : 'Sin consultar todavía'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={fetchRainEvents}
          disabled={isLoadingEvents || isDeletingEvents}
          className="group glass-card flex min-h-44 flex-col justify-between border-border/60 p-5 text-left transition-transform duration-300 hover:-translate-y-1 hover:border-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="space-y-3">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700 transition-colors group-hover:bg-emerald-500/16 dark:text-emerald-300">
              {isLoadingEvents ? <Loader2 className="size-5 animate-spin" /> : <Database className="size-5" />}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Ver registros de lluvia</h2>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Consulta el endpoint y abre un diálogo con el JSON resumido y una tabla con cada evento.
              </p>
            </div>
          </div>

          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <RefreshCw className="size-4" />
            {isLoadingEvents ? 'Consultando...' : 'Abrir diálogo con la respuesta'}
          </span>
        </button>

        <button
          type="button"
          onClick={deleteTodayRainEvents}
          disabled={isLoadingEvents || isDeletingEvents}
          className="group glass-card flex min-h-44 flex-col justify-between border-border/60 p-5 text-left transition-transform duration-300 hover:-translate-y-1 hover:border-red-500/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="space-y-3">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-red-500/12 text-red-700 transition-colors group-hover:bg-red-500/16 dark:text-red-300">
              {isDeletingEvents ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Borrar registros de lluvia de hoy</h2>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Ejecuta DELETE /api/rain-events con la API key cargada arriba para limpiar los eventos del día local.
              </p>
            </div>
          </div>

          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
            <Trash2 className="size-4" />
            {isDeletingEvents ? 'Borrando...' : 'Eliminar datos de hoy'}
          </span>
        </button>
      </section>

      {errorMessage ? (
        <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl border-border/60 bg-card/95 sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {eventsResponse ? 'Registros de lluvia de hoy' : 'Resultado de eliminación'}
            </DialogTitle>
            <DialogDescription>
              {eventsResponse
                ? 'La respuesta se muestra con la estructura exacta devuelta por el endpoint y una tabla para revisar cada evento.'
                : 'La respuesta confirma el borrado de los eventos del día local.'}
            </DialogDescription>
          </DialogHeader>

          {eventsResponse ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">date</div>
                  <div className="mt-2 text-base font-medium">{formatDate(eventsResponse.date)}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">count</div>
                  <div className="mt-2 text-base font-medium">{eventsResponse.count}</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">timestamp</div>
                  <div className="mt-2 text-base font-medium">{formatDateTime(eventsResponse.timestamp)}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      events
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {eventsResponse.events.length === 0 ? 'No hay registros para el día consultado.' : `${eventsResponse.events.length} fila(s) cargada(s).`}
                    </p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>recorded_at</TableHead>
                      <TableHead>created_at</TableHead>
                      <TableHead>is_offline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsResponse.events.length > 0 ? (
                      eventsResponse.events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-mono text-xs">{event.id}</TableCell>
                          <TableCell>{formatDateTime(event.recorded_at)}</TableCell>
                          <TableCell>{event.created_at ? formatDateTime(event.created_at) : '—'}</TableCell>
                          <TableCell>
                            <Badge variant={event.is_offline ? 'secondary' : 'outline'}>
                              {event.is_offline ? 'offline' : 'online'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No hay eventos para mostrar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : deleteResponse ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">success</div>
                <div className="mt-2 text-base font-medium">{deleteResponse.success ? 'true' : 'false'}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">date</div>
                <div className="mt-2 text-base font-medium">{formatDate(deleteResponse.date)}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">deleted</div>
                <div className="mt-2 text-base font-medium">{deleteResponse.deleted}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">timestamp</div>
                <div className="mt-2 text-base font-medium">{formatDateTime(deleteResponse.timestamp)}</div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}