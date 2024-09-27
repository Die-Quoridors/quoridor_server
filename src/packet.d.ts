
export interface GamePacketGameJoin {
    event: 'gameJoin'
    data: {
        game: string
    }
}

export interface GamePacketGameLeave {
    event: 'gameLeave'
    data: {
        player: number
    }
}

export interface GamePacketGameInit {
    event: 'gameInit'
    data: {
        player: number
        playerCount: number
        strictPlayer: boolean
        currentPlayer: number
    }
}

export interface GamePacketPlayerMove {
    event: 'playerMove'
    data: {
        player: number
        x: number
        y: number
    }
}

export interface GamePacketWallPlace {
    event: 'wallPlace'
    data: {
        player: number
        x: number
        y: number
        roation: string
    }
}

export interface GamePacketNextPlayer {
    event: 'nextPlayer',
    data: {
        player: number
    }
}

export interface GamePacketPlayerJoin {
    event: 'playerJoin',
    data: {
        player: number
    }
}

export type GamePacket = GamePacketGameJoin | GamePacketGameInit | GamePacketPlayerMove | GamePacketWallPlace | GamePacketNextPlayer | GamePacketPlayerJoin