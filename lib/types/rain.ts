export interface RainEvent {
  id: string
  recorded_at: string
  created_at: string
  is_offline: boolean
}

export interface RainEventInput {
  timestamp: number
}

/** Formato legacy: un timestamp por impulso. */
export interface RainEventsPayloadLegacy {
  offline_data?: boolean
  events: RainEventInput[]
}

/** Formato agregado por ventana: count impulsos al cierre de la ventana. */
export interface RainWindowPayload {
  offline_data?: boolean
  count: number
  timestamp: number
  window_start?: number
  window_end?: number
}

export type RainEventsPayload = RainEventsPayloadLegacy | RainWindowPayload

export interface RainEventInsert {
  recorded_at: string
  is_offline: boolean
}
