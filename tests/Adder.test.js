import { mount } from "enzyme"
import { act } from 'react-dom/test-utils'
import Adder from "../components/Adder"
import _ from "lodash"
import React from "react"
import fetchMock from "fetch-mock-jest"

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

fetchMock.post("http://api.bely.me/links", (called_url, opts) => {
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
describe("Adder", () => {
    it("creates a new link if url and slug are filled out", async () => {
        const adder = mount(<Adder triggerRefresh={jest.fn()}/> )
        let url = "testurl"
        let slug = "testslug"

        await act(async () => {
            await adder.find(".urlField").simulate('change', { target: { value: url } })
            await adder.find(".slugField > .textField").simulate('change', { target: { value: slug } })
            await adder.find("form").props().onSubmit({preventDefault: jest.fn()})

        })
        await adder.update()
        let sentOpts = JSON.parse(fetchMock.lastOptions().body)
        expect(sentOpts.url).toMatch(url)
        expect(sentOpts.slug).toMatch(slug)
        expect(fetchMock.lastResponse().status).toBe(201)

    })

    it("creates a new link if url but slug is NOT filled out", async () => {
        const adder = mount(<Adder triggerRefresh={jest.fn()}/> )
        let url = "testurl"

        await act(async () => {
            await adder.find(".urlField").simulate('change', { target: { value: url } })
            adder.update()
            await adder.find("form").props().onSubmit({preventDefault: jest.fn()})
        })
        await adder.update()
        let sentOpts = JSON.parse(fetchMock.lastOptions().body)
        expect(sentOpts.url).toMatch(url)
        expect(sentOpts.slug.length).toBeGreaterThan(1)
        expect(fetchMock.lastResponse().status).toBe(201)
    })

    it("tells the user what they typed to offend the api", async () => {
        const adder = mount(<Adder triggerRefresh={jest.fn()}/> )
        let slug = "loc"
        await act(async () => {
            await adder.find(".slugField > .textField").simulate('change', { target: { value: slug } })
            adder.update()
            await adder.find("form").props().onSubmit({preventDefault: jest.fn()})
        })
        await adder.update()
        let sentOpts = JSON.parse(fetchMock.lastOptions().body)
        expect(sentOpts.slug).toMatch(slug)
        expect(fetchMock.lastResponse().status).toBe(422)
        expect(adder.find(".offensive").text()).toMatch(slug)
    })
})
