import jwt from 'jsonwebtoken'
import {TokenDBType} from "../repositories/types";
import {settings} from "../settings";
import {tokenRepositories} from "../repositories/token-db-repositories";
import { v4 as uuidv4 } from 'uuid';


export const jwtService = {
    async createJwtToken(id: string) {

        const payload = {
            userId: id,
            deviceId: uuidv4()
        }

        const accessToken = jwt.sign({userId: id}, settings.JWT_SECRET, {expiresIn: '10s'})
        const refreshToken = jwt.sign({payload}, settings.JWT_SECRET, {expiresIn: '20s'})

        const decodedRefreshToken = jwt.decode(refreshToken)

        const jwtResult = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            decodedRefreshToken: decodedRefreshToken
        }
        return jwtResult
    },

    async getUserIdByToken(tokenFromHead: string) {

        try {
            const result: any = jwt.verify(tokenFromHead, settings.JWT_SECRET) // если verify не сработает, упадет ошибка

            return result.userId

        } catch (error) {
            return null
        }
    },

    async checkRefreshTokenIsValid(refreshToken: string) {

        try {
            const verifyRefTok: any = jwt.verify(refreshToken, settings.JWT_SECRET)
            return verifyRefTok

        } catch (error) {
            console.log(error)
            return null
        }

    },

    async getRefreshTokenFromDb(refreshToken: string): Promise<TokenDBType | null> {

        const decodedRefreshToken = jwt.decode(refreshToken)

        //console.log(decodedRefreshToken)

        const foundRefreshTokenInDb = await tokenRepositories.findToken(decodedRefreshToken)

        if (!foundRefreshTokenInDb) {
            return null
        } else {
            return foundRefreshTokenInDb
        }
    },

    async createNewRefreshToken (userId: string, deviceId: string) {

        const payload = {
            userId: userId,
            deviceId: deviceId
        }

        const newAccessToken = jwt.sign({userId: payload.userId}, settings.JWT_SECRET, {expiresIn: '10s'})
        const newRefreshToken = jwt.sign({payload}, settings.JWT_SECRET, {expiresIn: '20s'})
        const newDecodedRefreshToken = jwt.decode(newRefreshToken)

        const jwtResult = {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            decodedRefreshToken: newDecodedRefreshToken
        }
        return jwtResult
    },


}




/*



    async tryDecodeAndCreate(refreshToken: string) {

        // как лучше сделать?

        try {


            const checkRefreshTokenInDb = await tokenRepositories.findToken(refreshToken)




        const decodedRefreshToken: any = jwt.verify(refreshToken, settings.JWT_SECRET)

            const checkRefreshTokenInDb = await tokenRepositories.findToken(refreshToken)

            if (checkRefreshTokenInDb) {
                return null
            } else {

                const newAccessToken = jwt.sign({userId: decodedRefreshToken.userId}, settings.JWT_SECRET, {expiresIn: '10s'})
                const newRefreshToken = jwt.sign({userId: decodedRefreshToken.id}, settings.JWT_SECRET, {expiresIn: '20s'})

                const addOldTokenInDb =  await tokenService.createToken(refreshToken)
                // так можно ??

                const jwtResult = {accessToken: newAccessToken, refreshToken: newRefreshToken}
                return jwtResult
            }

        } catch (error) {
            return null
        }
        },

    async verifyToken(refreshToken: string) {

        try {
        const decodedRefreshToken: any = jwt.verify(refreshToken, settings.JWT_SECRET)
            //console.log(decodedRefreshToken)
        }  catch (error) {
        return null
    }
            const checkRefreshTokenInDb = await tokenRepositories.findToken(refreshToken)
        //console.log(checkRefreshTokenInDb)

            if (checkRefreshTokenInDb) {
                return null
            } else {
                const addOldTokenInDb = await tokenService.createToken(refreshToken)
                // так можно ??
                //console.log(addOldTokenInDb)

                return addOldTokenInDb
            }
    }
}*/