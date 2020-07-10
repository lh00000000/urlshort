import fetchMock from "fetch-mock-jest"
import _ from "lodash"
import api, { gbFetch } from "../api"
const links = [
    {
        url: "http://localhost:3000/",
        slug: "loc",
        short_url: "http://bely.me/loc",
    },
    {
        url: "asdfjo",
        slug: "dsjfoi",
        short_url: "http://bely.me/dsjfoi",
    },
]
fetchMock
    .get("http://api.bely.me/links", links)
    .get("http://api.bely.me/links/loc", {
        url: "http://localhost:3000/",
        slug: "loc",
        short_url: "http://bely.me/loc",
    })
    .post("http://api.bely.me/links", (called_url, opts) => {
        let { url, slug } = JSON.parse(opts.body)
        let errors = {}
        if (
            _(links)
                .map("url")
                .includes(url)
        ) {
            errors["url"] = ["has already been taken"]
        }
        if (
            _(links)
                .map("slug")
                .includes(slug)
        ) {
            errors["slug"] = ["has already been taken"]
        }
        if (_.keys(errors).length) {
            return {
                body: JSON.stringify({ errors }),
                status: 422,
            }
        } else {
            let short_url = "http://bely.me/" + slug
            let newLink = { short_url, url, slug }
            // links.push(newLink) // don't modify for now
            return {
                body: JSON.stringify(newLink),
                status: 201,
            }
        }
    })
    .delete("http://api.bely.me/links/loc", 204)
describe("gbFetch", () => {
    it("adds gb access token", async () => {
        gbFetch("GET", "links")
        expect("GB-Access-Token" in fetchMock.lastOptions().headers)
    })

    it("adds gb access token", async () => {
        gbFetch("GET", "links")
        expect(fetchMock.lastUrl()).toBe("http://api.bely.me/links")
    })

    it("converts obj to json", async () => {
        gbFetch("POST", "links", { a: 1 })
        expect(fetchMock.lastOptions().body).toMatch(JSON.stringify({ a: 1 }))
    })

    it("doesn't add a body if no data is supplied", async () => {
        gbFetch("POST", "links")
        expect(fetchMock.lastOptions().body).not.toBeDefined()
    })
})

describe("api", () => {
    it("get.all gets entire list", async () => {
        expect(await api.get.all()).toEqual(links)
    })
    it("get.one gets single link", async () => {
        expect(await api.get.one("loc")).toEqual({
            url: "http://localhost:3000/",
            slug: "loc",
            short_url: "http://bely.me/loc",
        })
    })
    it("delete hits delete api", async () => {
        let resp = await api.delete("loc")
        expect(fetchMock.lastResponse().status).toBe(204)
        expect(resp.status).toBe(204)
    })

    it("creates new link if url and slug have not been seen before", async () => {
        let resp = await api.create({ url: "0", slug: "0" })
        expect(fetchMock.lastResponse().status).toBe(201)
        expect(await fetchMock.lastResponse().json()).toEqual({
            url: "0",
            slug: "0",
            short_url: "http://bely.me/0",
        })
        expect(resp).toEqual({ respType: "SUCCESS" })
    })

    it("reports if dupe slug add is attempted", async () => {
        let resp = await api.create({ url: "0", slug: "loc" })
        expect(fetchMock.lastResponse().status).toBe(422)
        expect(await fetchMock.lastResponse().json()).toEqual({
            errors: { slug: ["has already been taken"] },
        })
        expect(resp).toEqual({ respType: "TAKEN_SLUG" })
    })

    it("reports if dupe url add is attempted", async () => {
        let resp = await api.create({
            url: "http://localhost:3000/",
            slug: "0",
        })
        expect(fetchMock.lastResponse().status).toBe(422)
        expect(await fetchMock.lastResponse().json()).toEqual({
            errors: { url: ["has already been taken"] },
        })
        expect(resp).toEqual({ respType: "TAKEN_URL" })
    })

    it("reports if dupe add is attempted where both url and slug seen before", async () => {
        let resp = await api.create({
            url: "http://localhost:3000/",
            slug: "loc",
        })
        expect(fetchMock.lastResponse().status).toBe(422)
        expect(await fetchMock.lastResponse().json()).toEqual({
            errors: {
                slug: ["has already been taken"],
                url: ["has already been taken"],
            },
        })
        expect(resp).toEqual({ respType: "TAKEN_SLUG_URL" })
    })
})
