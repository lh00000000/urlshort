import React, { useState, useEffect } from "react"
import { HOOK_GET, HOOK_SET, gray } from "../util"
import api from "../api"
import { v4 as uuidv4 } from 'uuid';

const createRandomizedLink = async ({ url }) => {
  var triesLeft = 20
  while (triesLeft > 0) {
    let resp = await api.create({ url, slug: uuidv4().substring(0, 3) })
    if (resp.respType === "SUCCESS") {
      return resp
    }
    triesLeft -= 1
  }
  throw `wow. sorry this shortener got too popular. might i interest you in a qr code instead? https://duckduckgo.com/?q=qr+${url}`
}

const createLink = ({ url, slug }) => {
  if (slug === "") {
    return createRandomizedLink({ url })
  } else {
    return api.create({ url, slug })
  }
}

const AdderForm = ({ exposition, onSubmit, slugHook, urlHook }) => {
  return (
    <div>
      <form
        onSubmit={(ev) => {
          ev.preventDefault()
          return onSubmit()
        }}
      >
        {exposition}
        <span>please shorten </span>
        <input
          className="urlField textField"
          placeholder="url"
          value={urlHook[HOOK_GET]}
          onChange={(ev) => urlHook[HOOK_SET](ev.target.value)}
        />
        <span> to </span>
        <div className="slugField">
          <input
            className="textField"
            placeholder="slug"
            value={slugHook[HOOK_GET]}
            onChange={(ev) => slugHook[HOOK_SET](ev.target.value)}
          />
          <div className="blankInfo">
            <span>(leave blank for random) </span>
          </div>
        </div>
        <input
          className="submitButton"
          type="submit"
          value="now"
          aria-label="now submit"
        />
        <span>.</span>
      </form>
      <style jsx="jsx">{`
        .urlField {
          width: 300px;
          color: ${gray(128)};
        }
        .slugField {
          margin: 0px 18px 0px 0px;
          width: 130px;
          display: inline-block;
        }
        .slugField .textField {
          width: 100%;
        }
        .blankInfo {
          color: ${gray(100)};
          font-size: 10px;
          position: absolute;
        }
        .textField {
          color: ${gray(13)};
          background-color: transparent;
          font-size: 14px;
          border-top: 0px;
          border-left: 0px;
          border-right: 0px;
          border-bottom: 2px dotted ${gray(128)};
        }
        .submitButton {
          background-color: transparent;
          color: ${gray(15)};
          padding: 10px;
          cursor: pointer;
        }
        .submitButton:hover {
          background-color: ${gray(10)};
        }
      `}</style>
    </div>
  )
}

export const Adder = ({ triggerRefresh }) => {
  const [err, setErr] = useState("NOERROR")
  const [waiting, setWaiting] = useState(false)
  const urlHook = useState("")
  const slugHook = useState("")
  const expositions = {
    NOERROR: <span />,
    BLANK_URL: (
      <span>now knowing that i cannot leave the url field blank, </span>
    ),
    TAKEN_URL: (
      <span>
        {"now knowing that the url "}
        <span className="offensive">{urlHook[HOOK_GET]}</span>
        {"is already in the system, "}
      </span>
    ),
    TAKEN_SLUG: (
      <span>
        {"now knowing that the slug "}
        <span className="offensive">{slugHook[HOOK_GET]}</span>
        {" is already in the system, "}
      </span>
    ),
    TAKEN_SLUG_URL: (
      <span>
        {"now knowing that both the slug "}
        <span className="offensive">{slugHook[HOOK_GET]}</span>
        {" and the url"}
        <span className="offensive">{urlHook[HOOK_GET]}</span>
        {"are already in the system, "}
      </span>
    ),
  }
  let onSubmit = async () => {
    setWaiting(true)
    let resp = await createLink({
      url: urlHook[HOOK_GET],
      slug: slugHook[HOOK_GET],
    })
    setWaiting(false)
    setErr(resp.respType)
    if (resp.respType === "SUCCESS") {
      urlHook[HOOK_SET]("")
      slugHook[HOOK_SET]("")
      triggerRefresh()
    }
  }

  return (
    <div>
      {!waiting && (
        <AdderForm
          exposition={expositions[err]}
          onSubmit={onSubmit}
          urlHook={urlHook}
          slugHook={slugHook}
        />
      )}
      {waiting && (
        <p>
          <span>i see that </span>
          <span>{urlHook[HOOK_GET]}</span>
          <span> is being shortened to</span>
          <span>{slugHook[HOOK_GET]}</span>
          <span>...</span>
        </p>
      )}
      <style jsx="jsx">{`
        div {
          color: ${gray(128)};
          font-size: 20px;
        }
      `}</style>
    </div>
  )
}

export default Adder
