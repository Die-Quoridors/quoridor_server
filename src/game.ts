import ws from 'ws'

export interface Game {
    strictPlayer: boolean
    playerCount: number
    wallLimit: number
    connections: {
        socket: ws
        playerId: number
    }[]
}

export const games = new Map<String, Game>()