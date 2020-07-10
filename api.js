import _ from "lodash"

const GB_HOST = "http://api.bely.me"
const GB_TOKEN = process.env.NEXT_PUBLIC_GB_TOKEN

export const gbFetch = (
  method,
  route,
  data // TEST
) =>
  fetch(GB_HOST + "/" + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      "GB-Access-Token": GB_TOKEN,
    },
    ...(_.isUndefined(data) ? {} : { body: JSON.stringify(data) }),
  })

export default {
  get: {
    all: () => gbFetch("GET", "links").then((res) => res.json()), // test return arr or link
    one: (slug) => gbFetch("GET", `links/${slug}`).then((res) => res.json()), // test return non or link
  },
  delete: (slug) => gbFetch("DELETE", `links/${slug}`),
  create: async ({ url, slug }) => {
    let resp = await gbFetch("POST", "links", { url, slug }).then((res) =>
      res.json()
    )
    let errorShapes = [
      [
        {
          slug: ["has already been taken"],
          url: ["has already been taken"],
        },
        "TAKEN_SLUG_URL",
      ],
      [{ url: ["can't be blank"] }, "BLANK_URL"],
      [{ url: ["has already been taken"] }, "TAKEN_URL"],
      [{ slug: ["has already been taken"] }, "TAKEN_SLUG"],
    ]

    if ("errors" in resp) {
      return {
        respType: _(errorShapes).find(([shape, code]) =>
          _.isMatch(resp.errors, shape)
        )[1],
      }
    } else {
      return { respType: "SUCCESS" }
    }
  },
}
