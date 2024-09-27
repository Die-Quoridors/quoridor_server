import ws from 'ws'
import { Game, games, WallRotation } from './game'
import { GamePacket, GamePacketGameInit, GamePacketGameLeave, GamePacketNextPlayer, GamePacketPlayerJoin } from './packet'

const server = new ws.WebSocketServer({
    port: 8080
})



server.on('error', console.error)

server.on('connection', connection => {
    console.log('connected')

    let gameId: string | undefined = undefined
    let playerId: number | undefined = undefined

    connection.on('message', msg => {
        const packet: GamePacket = JSON.parse(msg.toString())
        console.log('message', packet)

        let game = gameId ? games.get(gameId) : undefined

        switch (packet.event) {
            case 'gameJoin': {
                gameId = packet.data.game
                game = games.get(gameId)
                if (!game) {
                    connection.send(JSON.stringify({
                        event: 'error',
                        data: {
                            error: 'game not found'
                        }
                    }))
                    break
                }
                playerId = new Array(game.playerCount).fill(1).map((v, i) => i).filter(v => !game!.connections.some(con => con.playerId == v))[0]
                const initPacket: GamePacketGameInit = {
                    event: 'gameInit',
                    data: {
                        player: playerId,
                        playerCount: game.playerCount,
                        strictPlayer: game.strictPlayer,
                        currentPlayer: game.currentPlayer
                    }
                }

                const joinPacket: GamePacketPlayerJoin = {
                    event: 'playerJoin',
                    data: {
                        player: playerId
                    }
                }

                console.log('send', joinPacket)
                for (const con of game.connections.filter(con => con.socket != connection)) {
                    con.socket.send(JSON.stringify(joinPacket))
                }

                console.log('send', initPacket)
                game.connections.push({
                    socket: connection,
                    playerId
                })
                connection.send(JSON.stringify(initPacket))
            } break
            case 'wallPlace':
            case 'playerMove': {
                if (!game) {
                    break
                }

                const playerIndex = game.connections.findIndex(c => c.playerId == playerId)
                const nextPlayerIndex = playerIndex + 1 >= game.connections.length ? 0 : playerIndex + 1
                game.currentPlayer = game.connections[nextPlayerIndex].playerId

                const nextPlayerPacket: GamePacketNextPlayer = {
                    event: 'nextPlayer',
                    data: {
                        player: game.currentPlayer
                    }
                }

                console.log('send', 'relay')
                for (const con of game.connections.filter(con => con.socket != connection)) {
                    con.socket.send(JSON.stringify(packet))
                }

                console.log('send', nextPlayerPacket)
                for (const con of game.connections) {
                    con.socket.send(JSON.stringify(nextPlayerPacket))
                }

                switch (packet.event) {
                    case 'playerMove': {
                        game.positions.players[packet.data.player] = {
                            x: packet.data.x,
                            y: packet.data.y
                        }
                    } break
                    case 'wallPlace': {
                        game.positions.walls.push({
                            x: packet.data.x,
                            y: packet.data.y,
                            rotation: packet.data.roation as WallRotation
                        })
                    } break
                }
            } break
        }
    })

    connection.once('close', () => {
        if (!gameId || !games.has(gameId)) {
            return
        }
        const game = games.get(gameId)!
        const i = game.connections.findIndex(con => con.socket == connection)
        game.connections.splice(i, 1)

        const packet: GamePacketGameLeave = {
            event: 'gameLeave',
            data: {
                player: playerId!
            }
        }
        console.log('send', packet)
        for (const con of game.connections.filter(con => con.socket != connection)) {
            con.socket.send(JSON.stringify(packet))
        }

        if (game.connections.length == 0) {
            console.log('delete game', gameId)
            games.delete(gameId)
        }
    })
})