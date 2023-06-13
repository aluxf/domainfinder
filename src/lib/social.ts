const {JSDOM} = require("jsdom")

async function availableOnInstagram(handle: string) {
    const formData = new FormData()
    formData.append("q", handle),
    formData.append("fishondreo", "1")
    formData.append("type", "y")
    const response = await fetch(`https://instausername.com/availability`,{
        method: "POST",
        body: formData
    })
    if (!response.ok || !response.body){
        console.log(response)
        throw new Error("Instagram - Failed to check handle")
    }

    const data = await response.text()
    const dom = new JSDOM(data)
    const doc = dom.window.document
    const result_div = doc.querySelector("#resmes")
    if (!result_div) {
        throw Error("Instagram - Failed to retrieve result.")
    }
    
    return result_div.textContent.includes("free")
}

async function availableOnTwitter(handle: string) {
    const formData = new FormData()
    formData.append("username", handle)
    const response = await fetch(`https://www.mediamister.com/get_twitter_handle`,{
        method: "POST",
        body: formData
    })

    if (!response.ok || !response.body){
        console.log(response)
        throw new Error("Twitter - Failed to check handle")
    }

    const data = await response.text()
    const dom = new JSDOM(data)
    const doc = dom.window.document
    const available_span = doc.querySelector(".handle_available")
    return available_span != undefined
}

async function availableOnYoutube(handle: string) {
    const response = await fetch(`https://youtools.martview-forum.com/inc/ajax.php?username=${handle}`)
    if (!response.ok || !response.body){
        console.log(response)
        throw new Error("Instagram - Failed to check handle")
    }

    const data = await response.text()
    return data.trim() == ""
}

/** 
const scoreFewShotMessage = [
    {
        role: "user",
        content: scorePrompt("A chatbot powered by AI that can answer any question regarding a pdf document.",[
            "PDFBuddy",
            "DocuMate",
            "PDFChum",
            "ReadEasey",
            "DocuQ",
            "PDFriendo",
            "InfoPal",
            "DocuZen",
            "PDFGenie"
        ])
    },
    {
        role: "assistant",
        content: `{
            "PDFBuddy": {"length": 5, "readability": 4.5, "recall": 4.5},
            "DocuMate": {"length": 5, "readability": 4.5, "recall": 4},
            "PDFChum": {"length": 5, "readability": 4, "recall": 4},
            "ReadEasey": {"length": 5, "readability": 4, "recall": 4.5},
            "DocuQ": {"length": 5, "readability": 4, "recall": 3.5},
            "PDFriendo": {"length": 4.5, "readability": 3.5, "recall": 4},
            "InfoPal": {"length": 5, "readability": 4.5, "recall": 4.5},
            "DocuZen": {"length": 5, "readability": 4.5, "recall": 4},
            "PDFGenie": {"length": 5, "readability": 4.5, "recall": 4.5}
        }`
    },
    {
        role: "user",
        content: scorePrompt([""])
    },
    {
        role: "assistant",
        content: 'Covelet,CoverGenie,JobSnap,OneShotCover,CoverWiz,Resume2Letter,CoverOne,CoverGo,MyCoverWrite,CareerCraft'
    },
]
*/


export async function getSocialData(handle:string) {
    const instagram = await availableOnInstagram(handle)
    const twitter = await availableOnTwitter(handle)
    const youtube = await availableOnYoutube(handle)

    return {
        instagram,
        twitter,
        youtube
    }
}