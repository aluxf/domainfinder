import z from "zod"
import { generateBrands, brandPrompt } from "~/lib/openai"
import {getGoDaddyData} from "~/lib/domain"
import { NextApiRequest, NextApiResponse } from 'next';

const brandCreateSchema = z.object({
    generatedDomains: z.object({
        name: z.string(),
        price: z.number()
    }).array(),
    info: z.string(),
    style: z.string(),
    positives: z.string().array(),
    negatives: z.string().array(),
    tldList: z.string().array()
})

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const json = JSON.parse(req.body)
        const { tldList, ...promptData} = brandCreateSchema.parse(json)
        console.log(promptData)
        const prompt = brandPrompt(promptData, 10)
        const brandNames: string[] = await generateBrands(prompt)
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


        res.status(200).json(domainDatas)
    }
    catch (error: any){
        console.log(error)
        return res.status(500).json({error: "An error occurred."})
    }
}