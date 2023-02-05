import { PhoneNumber, isValidPhoneNumber } from "libphonenumber-js"
import { start } from "repl"
import parsePhoneNumber, { isValidNumber} from "libphonenumber-js"
import { create, Whatsapp, Message, SocketState } from "venom-bot"

export type QRCode = {
    base64Qr: string
    attempts: number
}
class Sender {
    private client: Whatsapp
    private conected: boolean
    private qr: QRCode

    get isConnected(): boolean {
        return this.conected
    }

    get qrCode(): QRCode {
        return this.qr
    }

    constructor() {
        this.initialize()
    }

    async sendText(to: string, body: string) {
        
        if(!isValidPhoneNumber(to, "BR")) {
            throw new Error("this number is not valid")
        }

        let phoneNumber = parsePhoneNumber(to, "BR")
            ?.format("E.164")
            ?.replace("+", "") as string

        phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`
        
        await this.client.sendText(to, body)
    }

    private initialize() {

        const qr = (base64Qr: string, asciiQR: string, attempts: number) => {
            this.qr = { base64Qr, attempts }
        }

        const status = (statusSession: string) => {
        this.conected = ["isLogged", "qrReadSuccess", "chatsAvailable"].includes(
            statusSession
        )
        }

        const start = (client: Whatsapp) => {
            this.client = client

            client.onStateChange((state) => {
                this.conected = state === SocketState.CONNECTED
            })
        }
        create("ws-dev", qr, status)
            .then((client) => start(client))
            .catch((error) => {console.log(error)})
    }
}

export default Sender