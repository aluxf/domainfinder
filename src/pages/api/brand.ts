import z from "zod"
import { generateBrands, brandPrompt} from "~/lib/openai"
import {getGoDaddyData} from "~/lib/domain"
import { NextApiRequest, NextApiResponse } from 'next';

const brandCreateSchema = z.object({
    info: z.string(),
    style: z.string(),
    positives: z.string().array(),
    negatives: z.string().array(),
    temperature: z.number(),
    tldList: z.string().array()
})

async function getDomainNameBatch(brandNames:string[], tldList: string[]) {
    const domains: string[] = []
    for (const brandName of brandNames) {
        for (const tld of tldList) {
            const domain = brandName + tld
            domains.push(domain)
        }
    }
    const goDaddyData = await getGoDaddyData(domains)
    const domainDatas =  goDaddyData.filter(
        (data: any) => data.available == true
    ).map((data: any) => {
        return {
            name: data.domain,
            price: data.price
        }
    })
    return domainDatas
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const json = JSON.parse(req.body)
        const { tldList, temperature, ...promptData} = brandCreateSchema.parse(json)
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        console.log(temperature)
        let prevBrandNames:string[] = []
        for (let i = 0; i < 3; i++) {
            const prompt = brandPrompt(promptData, prevBrandNames, 10)
            const brandNames: string[] = await generateBrands(prompt, temperature)
            prevBrandNames = [...prevBrandNames, ...brandNames]
            const domainDatas = await getDomainNameBatch(brandNames, tldList)
            res.write(JSON.stringify(domainDatas) + "\n")
        }
        res.end()
    }
    catch (error: any){
        console.log(error)
        return res.status(500).json({error: "An error occurred."})
    }
}