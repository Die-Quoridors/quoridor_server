import ws from 'ws'
import { v4 as uuid } from 'uuid'

export const playerStartPosMap: Pos[] = [
    { x: 4, y: 0 },
    { x: 4, y: 8 },
    { x: 0, y: 4 },
    { x: 8, y: 4 }
]

export const playerTurnMappings = [
    [],
    [0],
    [0, 1],
    [0, 1, 2],
    [0, 3, 1, 2]
]

export interface Pos {
    x: number
    y: number
}

export enum WallRotation {
    Vertical = 'Vertical',
    Horizontal = 'Horizontal'
}

export interface Wall extends Pos {
    rotation: WallRotation
    placer: number
}

export interface Positions {
    players: Pos[]
    walls: Wall[]
}

export interface Game {
    strictPlayer: boolean
    playerCount: number
    wallLimit: number
    connections: {
        socket: ws
        playerId: number
    }[]
    currentPlayer: number
    positions: Positions
}

export const games = new Map<String, Game>()

export const createGame = (playerCount: number, wallLimit: number) => {
    const players: Pos[] = []

    for (let i = 0; i < playerCount; i++) {
        players.push({...playerStartPosMap[i]})
    }

    const gameId = uuid()
    games.set(gameId, {
        playerCount,
        wallLimit,
        strictPlayer: true,
        connections: [],
        currentPlayer: 0,
        positions: {
            players,
            walls: []
        }
    })

    return gameId
}

export const calculateNextTurn = (playerCount: number, currentTurn: number) => {
    const turnMappings = playerTurnMappings[playerCount]
    const turnStage = turnMappings.reduce((p, v, i) => v == currentTurn ? i : p, -1)
    const nextTurnStage = turnStage + 1 >= playerCount ? 0 : turnStage + 1
    return turnMappings[nextTurnStage]
}