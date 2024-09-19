import ws from 'ws'

export interface Game {
    strictPlayer: boolean
    playerCount: number
    wallLimit: number
    connections: ws[]
}

export const games = new Map<String, Game>()