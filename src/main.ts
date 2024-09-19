import ws from 'ws'
import { Game, games } from './game'
import { GamePacket, GamePacketGameInit } from './packet'

const server = new ws.WebSocketServer({
    port: 8080
})



server.on('error', console.error)

server.on('connection', connection => {
    console.log('connected')

    let game: Game | undefined = undefined;

    connection.on('message', msg => {
        const packet: GamePacket = JSON.parse(msg.toString())
        console.log('message', packet)
        switch (packet.event) {
            case 'gameJoin': {
                game = games.get(packet.data.game)
                if (!game) {
                    connection.send(JSON.stringify({
                        event: 'error',
                        data: {
                            error: 'game not found'
                        }
                    }))
                    break
                }
                const initPacket: GamePacketGameInit = {
                    event: 'gameInit',
                    data: {
                        player: game.connections.length,
                        playerCount: game.playerCount,
                        strictPlayer: game.strictPlayer
                    }
                }
                game.connections.push(connection)
                connection.send(JSON.stringify(initPacket))
            } break
            case 'wallPlace':
            case 'playerMove': {
                if (!game) {
                    break
                }
                for (const con of game.connections.filter(con => con != connection)) {
                    con.send(JSON.stringify(packet))
                }
            } break
        }
    })

    connection.once('close', () => {
        if (!game) {
            return
        }
        const i = game.connections.findIndex(con => con == connection)
        game.connections.splice(i, 1)
    })
})