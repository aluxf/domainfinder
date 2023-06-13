import z from "zod"
import { generateBrands, brandPrompt} from "~/lib/openai"
import {getGoDaddyData} from "~/lib/domain"
import { NextApiRequest, NextApiResponse } from 'next';
import { getSocialData } from "~/lib/social";

export const config = {
    runtime: 'edge', // this is a pre-requisite
  };

const brandCreateSchema = z.object({
    info: z.string(),
    style: z.string(),
    positives: z.string().array(),
    negatives: z.string().array(),
    temperature: z.number(),
    tldList: z.string().array()
})

interface BrandData {
    brand: string,
    tlds: Record<string,number>,
}

async function getBrandTldData(brandNames:string[], tldList: string[]) {
    const domains: string[] = []
    for (const brandName of brandNames) {
        for (const tld of tldList) {
            const domain = brandName + tld
            domains.push(domain)
        }
    }
    const goDaddyData = await getGoDaddyData(domains)
    const brandTldData: Record<string, Record<string,number>>  = {};
    goDaddyData.filter(
        (data: any) => data.available == true
    ).map((data: any) => {
        const [name,tld] = data.domain.split(".")
        const price = data.price / 10**6
        const tld_obj = brandTldData[name]
        if (!tld_obj) {
            brandTldData[name] = {
                [tld] : price
            }
            return
        }

        tld_obj[tld] = price
        return
    })

    return brandTldData
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const json = JSON.parse(req.body)
        const { tldList, temperature, ...promptData} = brandCreateSchema.parse(json)
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        let prevBrandNames:string[] = []
        for (let i = 0; i < 3; i++) {
            const responseData: BrandData[] = []
            const prompt = brandPrompt(promptData, prevBrandNames, 10)
            const brandNames: string[] = await generateBrands(prompt, temperature)
            prevBrandNames = [...prevBrandNames, ...brandNames]
            const brandTldData = await getBrandTldData(brandNames, tldList)
            for (const brandName in brandTldData) {
                responseData.push({
                    brand: brandName,
                    tlds: brandTldData[brandName]!,
                })
            }
            res.write(JSON.stringify(responseData) + "\n")
        }
        res.end()
    }
    catch (error: any){
        console.log(error)
        return res.status(500).json({error: "An error occurred."})
    }
}