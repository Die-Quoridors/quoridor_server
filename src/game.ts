import ws from 'ws'

export interface Game {
    strictPlayer: boolean
    playerCount: number
    wallLimit: number
    connections: ws[]
    playerIds: number[]
}

export const games = new Map<String, Game>()