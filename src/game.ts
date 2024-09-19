import ws from 'ws'

export interface Game {
    strictPlayer: boolean
    playerCount: number
    connections: ws[]
}

export const games = new Map<String, Game>()

games.set('testgame', {
    strictPlayer: true,
    playerCount: 4,
    connections: []
})