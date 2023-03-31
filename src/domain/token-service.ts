import {TokenDBType} from "../repositories/types";
import {tokenRepositories} from "../repositories/token-db-repositories";

export const tokenService= {

    async createTokenDB(decodedRefreshToken: any, ip: string, deviceTitle: string): Promise<boolean> {

        const newRefTokenDb: TokenDBType =
            {
                iat: decodedRefreshToken.iat,
                exp: decodedRefreshToken.exp,
                deviceId: decodedRefreshToken.payload.deviceId,
                deviceTitle: deviceTitle,
                ip: ip,
                userId: decodedRefreshToken.payload.userId
            }

            const checkDeviceInDb = await tokenRepositories.findUserByDeviceId(newRefTokenDb.deviceId)

        if (!checkDeviceInDb) {
            const addNewTokenToDb = await tokenRepositories.addToken(newRefTokenDb)
            return addNewTokenToDb
        } else {
            const isUpdatedTokenInfoInDb = await tokenRepositories.updateTokenIatExpIp(newRefTokenDb)
            return isUpdatedTokenInfoInDb
        }

    },

    async updateTokenDB(decodedRefreshToken: any, ip: string): Promise<boolean> {

        return await tokenRepositories.updateToken (decodedRefreshToken, ip)
    },

    async deleteToken (foundTokenInDb: TokenDBType): Promise<boolean> {

        return await tokenRepositories.deleteToken(foundTokenInDb)

    }
}
