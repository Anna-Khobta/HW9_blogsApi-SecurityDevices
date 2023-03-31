import nodemailer from "nodemailer";
import {UserDbType} from "../repositories/types";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import {usersRepository} from "../repositories/users-db-repositories";

export const emailsManager = {
    async sendEmailConfirmationMessage (newUser: UserDbType) {

        const myPass = process.env.EMAIL

// create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "menthol.vegan@gmail.com", // generated ethereal user
                pass: myPass, // generated ethereal password
            },
        });


const confirmationCode = newUser.emailConfirmation.confirmationCode

        const html = `
    <h1>Thank you for registering</h1>
    <p>To finish registration, please follow the link below:</p>
    <p><a href='${confirmationCode}'>Complete registration</a></p>
`;

        const html2 = `<h1>Thank you for registration!</h1><p>To finish registration process please follow the link below:<a href="https://somesite.com/confirm-email?code=${confirmationCode}">complete registration</a></p>`


// send mail with defined transport object
        let info = await transporter.sendMail({
            from: "AnnaTestEmail",  // sender address
            to: newUser.accountData.email, // list of receivers
            subject: "Confirmation Message", // Subject line
            html: html2 })
        // html body

        return info
    },


    async resendEmailConfirmationMessage (foundUserByEmail: UserDbType) {

        const myPass = process.env.EMAIL

// create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "menthol.vegan@gmail.com", // generated ethereal user
                pass: myPass, // generated ethereal password
            },
        });

        const generateConfirmationCode = uuidv4()
        const generateExpirationDate = add(new Date(), {
            hours: 1,
            minutes: 2
        })

        console.log( generateConfirmationCode)
        console.log( generateExpirationDate)

        const upgradeUserCode = await usersRepository.updateConfirmationCode(foundUserByEmail.id, generateConfirmationCode, generateExpirationDate)

        const html = `
    <h1>Thank you for registering</h1>
    <p>To finish registration, please follow the link below:</p>
    <p><a href='${generateConfirmationCode}'>Complete registration</a></p>
`;

        const html2 = `<h1>Thank you for registration!</h1><p>To finish registration process please follow the link below:<a href="https://somesite.com/confirm-email?code=${generateConfirmationCode}">complete registration</a></p>`


// send mail with defined transport object
        let info = await transporter.sendMail({
            from: "AnnaTestEmail",  // sender address
            to: foundUserByEmail.accountData.email, // list of receivers
            subject: "Resend confirmation Message", // Subject line
            html: html2 })
        // html body

        return info
    }
}