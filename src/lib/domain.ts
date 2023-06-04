const whoiser = require("whoiser")

const GODADDY_KEY = "e52xRr8mNG7Q_DFw8ArPS6jBoHWsm2YVinZ"
const GODADDY_SECRET = "DUNTQpkt1T9eTPKpnbrXBz"

async function domainIsFree(domain: string) {
    const domainData = await whoiser.domain(domain)
    const firstKey = Object.keys(domainData)?.[0]
    if (!firstKey) {
        return true
    }
    return domainData[firstKey]["Name Server"].length === 0
}

async function filterAvailableDomains(domains: string[]) {
    const availabilityPromises = domains.map((domain) => { 
        return domainIsFree(domain)
    })
    const availabilityResults = await Promise.all(availabilityPromises);

    return domains.filter((_, index) => availabilityResults[index]);
}


export async function getGoDaddyData(domains: string[]) {
    const response = await fetch("https://api.godaddy.com/v1/domains/available", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorization" : `sso-key ${GODADDY_KEY}:${GODADDY_SECRET}`
        },
        body: JSON.stringify(domains)
    })
    console.log(response.status)
    const data = await response.json()
    return data.domains
}
