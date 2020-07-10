import { shallow } from "enzyme"
import Link from "../components/Link"
import React from "react"
import fetchMock from "fetch-mock-jest"

describe("Link", () => {
    it("renders url and slug text", () => {
        let url = "fakeurl"
        let slug = "fakeslug"
        let short_url = "fakebely"
        const link = shallow(
            <Link url={url} slug={slug} short_url={short_url} />
        )
        expect(link.find(".long_url").text()).toMatch(url)
        expect(link.find(".slug").text()).toMatch(slug)
    })

    it("contains a clickable short_url text (to long link)", () => {
        let url = "fakeurl"
        let slug = "fakeslug"
        let short_url = "fakebely"
        const link = shallow(
            <Link url={url} slug={slug} short_url={short_url} />
        )
        expect(link.find(".long_url > a").prop("href")).toBe(url)
    })

    it("has a delete button", async () => {
        let url = "fakeurl"
        let slug = "fakeslug"
        let short_url = "fakebely"
        fetchMock.delete("http://api.bely.me/links/" + slug, 204)
        const link = shallow(
            <Link url={url} slug={slug} short_url={short_url} />
        )

        link.simulate("mouseover")
        await link.find("button.deleteButton")
            .props()
            .onClick({stopPropagation: jest.fn()})
        expect(fetchMock.lastResponse().status).toBe(204)
    })
})
