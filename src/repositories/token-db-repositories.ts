import {decodedRefreshTokenType, deviceViewType, TokenDBType} from "./types";
import {tokensCollection} from "./db";


export const tokenRepositories = {

    async addToken(newRefTokenDb: TokenDBType): Promise < boolean > {

        const insertNewTokenToDb= await tokensCollection.insertOne(newRefTokenDb)

        return insertNewTokenToDb.acknowledged
    },

    async findToken(decodedRefreshToken: decodedRefreshTokenType): Promise< TokenDBType | null > {

        const foundTokenInDb =  await tokensCollection.findOne(
            {userId: decodedRefreshToken.payload.userId,
                iat: decodedRefreshToken.iat}, {projection: {_id: 0}})

        if (!foundTokenInDb) {
            return null
        } else {
            return foundTokenInDb
        }
    },


   async findAllDevices (findTokenInDb: TokenDBType): Promise< deviceViewType[]> {

       const foundAllTokensInDb = await tokensCollection.find(
           {userId: findTokenInDb.userId},
           {
               projection: {
                   _id: 0,
                   ip: 1,
                   deviceTitle: 1,
                   iat: 1,
                   deviceId: 1
               }
           })
           .toArray()

       const items: deviceViewType[] = foundAllTokensInDb.map( tokensInfo => ({
           ip: tokensInfo.ip,
           title: tokensInfo.deviceTitle,
           lastActiveDate: (tokensInfo.iat).toString(),
           deviceId: tokensInfo.deviceId
           }))

       return items

   },

    async findUserByDeviceId (id: string): Promise< string | null > {

        const foundTokenInDb =  await tokensCollection.findOne(
            {deviceId: id}, {projection: {_id: 0}})

        if (!foundTokenInDb) {
            return null
        } else {
            return foundTokenInDb.userId
        }
    },

    async updateToken (decodedRefreshToken: any, ip:string): Promise<boolean> {

        const result = await tokensCollection.updateOne({userId: decodedRefreshToken.payload.userId, deviceId: decodedRefreshToken.payload.deviceId},
            {$set: {iat: decodedRefreshToken.iat,
                    exp: decodedRefreshToken.exp,
                    ip: ip}})
        return result.matchedCount === 1

        },

    async deleteToken (foundTokenInDb: TokenDBType): Promise <boolean> {

        const result = await tokensCollection.deleteOne({userId: foundTokenInDb.userId,
            deviceId: foundTokenInDb.deviceId,
            iat:foundTokenInDb.iat})

        return result.deletedCount === 1

    },


    async deleteDevice (id: string): Promise <boolean> {

        const result = await tokensCollection.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },

    async deleteAllExcludeOne (deviceId: string): Promise <boolean> {

        const result = await tokensCollection.deleteMany({ deviceId: { $ne: deviceId } })

        return result.acknowledged

    }
    }