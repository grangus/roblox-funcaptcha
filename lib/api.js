let http = require("./http")
let session = require("./session")
let util = require("./util")

function getToken(publicKey, blob) {
    return new Promise(async a => {
        a(JSON.parse(await http({
            url: "https://roblox-api.arkoselabs.com/fc/gt2/public_key/" + publicKey,
            method: "POST",
            data: `bda=${await util.get_bda()}&public_key=${publicKey}${blob ? `&data[blob]=${encodeURIComponent(blob)}` : ""}`,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
            }
        })))
    })
}

function getFuncaptcha(token) {
    return new Promise(async a => {
        let sid = typeof token == "object" ? token.token.match(/r=(.+?)\|/)[1] : token.match(/r=(.+?)\|/)[1]
        let captchaToken = typeof token == "object" ? token.token.split("|")[0] : token.match(/([0-9a-f\.]{20,})/)[0] // Try to get the token if invalid input was given
        let captcha = await http({
            url: "https://roblox-api.arkoselabs.com/fc/gfct/", 
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36", "Content-Type": "application/x-www-form-urlencoded" },
            data: `token=${captchaToken}&sid=${sid}`,
            method: "POST"
        })
        let captchaInfo = JSON.parse(captcha)
        if(captchaInfo.error) {
            console.log("Error")
            console.log(captchaInfo.error)
            return false
        } else {
            a(new session(captchaInfo, captchaToken))
        }
    })
}

function getDecryptionKey(captchaInfo) {
    return new Promise(async a => {
        let response = await http({
            method: "POST",
            url: "https://roblox-api.arkoselabs.com/fc/ekey/",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: `session_token=${captchaInfo.session_token}&game_token=${captchaInfo.challengeID}`
        })
        a(response)
    })

}

module.exports = { getFuncaptcha, getToken, getDecryptionKey }