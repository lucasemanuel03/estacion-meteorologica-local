export interface RainEvent {
  id: string
  recorded_at: string
  created_at: string
  is_offline: boolean
}

export interface RainEventInput {
  timestamp: number
}

export interface RainEventsPayload {
  offline_data?: boolean
  events: RainEventInput[]
}

export interface RainEventInsert {
  recorded_at: string
  is_offline: boolean
}
