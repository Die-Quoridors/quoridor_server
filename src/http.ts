import express from 'express'
import { v4 as uuid } from 'uuid'
import { games } from './game'

const app = express()
app.use(express.json())

app.get('/info', (req, res) => {
    res.json({
        wsPort: 8080
    })
})

interface GameCreateBody {
    playerCount: number
    wallLimit: number
}

app.post<any, any, any, GameCreateBody>('/game', (req, res) => {
    const { playerCount, wallLimit } = req.body
    if (playerCount == undefined || wallLimit == undefined) {
        res.status(400).json({
            error: 'invalid game create data'
        })
        return
    }

    const gameId = uuid()
    games.set(gameId, {
        playerCount,
        wallLimit,
        strictPlayer: true,
        connections: [],
        playerIds: []
    })
    res.json({
        gameId
    })
})

app.get('/game/:gameId', (req, res) => {
    const { gameId } = req.params
    if (!games.has(gameId)) {
        res.status(400).json({
            error: 'invalid gameId'
        })
        return
    }
    const game = games.get(gameId)!
    res.json({
        playerCount: game.playerCount,
        wallLimit: game.wallLimit,
        strictPlayer: game.strictPlayer,
        currentPlayers: game.connections.length
    })
})

app.delete('/game/:gameId', (req, res) => {
    const { gameId } = req.params
    if (games.has(gameId)) {
        games.delete(gameId)
        res.end()
    } else {
        res.status(400).json({
            error: 'invalid gameId'
        })
    }
})

app.listen(25590)