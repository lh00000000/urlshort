import React, { useState, useEffect } from "react"
import { useClipboard } from "use-clipboard-copy"
import { HOOK_GET, HOOK_SET, gray, wait } from "../util"
import api from "../api"

const useDeleteLink = ({ slug, justDeletedTimeout }) => {
  // TEST PROGRESSION
  // states -> DORMANT DELETING JUSTDELETED DELETED
  const [state, setState] = useState("DORMANT")

  return {
    state,
    delete: async () => {
      setState("DELETING")
      await api.delete(slug)
      setState("JUSTDELETED")
      await wait(justDeletedTimeout)
      setState("DELETED")
    },
  }
}

const statusMessage = ({ deletion, clipboard }) => {
  // TEST
  if (clipboard.copied) {
    return "copied"
  } else if (deletion.state === "DELETING") {
    return "deleting"
  } else if (deletion.state === "JUSTDELETED") {
    return "deleted"
  } else {
    return "click to copy"
  }
}

export const Link = ({ slug, short_url, url, triggerRefresh }) => {
  const [hovered, setHovered] = useState(false)
  const clipboard = useClipboard({
    copiedTimeout: 500,
  })
  const deletion = useDeleteLink({ slug, justDeletedTimeout: 600 })

  return (
    <div
      className={"link " + (hovered ? "highlighted" : "")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={"topLeftOverlay " + (hovered ? "" : "hidden")}>
        <button
          className="deleteButton clickable"
          aria-label="delete"
          onClick={(ev) => {
            ev.stopPropagation()
            return deletion.delete().then(triggerRefresh)
          }}
        >
          {"x"}
        </button>
        <div className="status">
          <span>{statusMessage({ deletion, clipboard }) + " "}</span>
          <a className="short_url clickable" href={short_url} target="_blank">
            <span>{short_url}</span>
          </a>
        </div>
      </div>

      <div className="nonControls newPositionOrigin">
        <div className="linkOverlay">
          <p className="long_url">
            <a className="clickable" href={short_url} target="_blank">
              {clipboard.copied ? "copied " + short_url : url}
            </a>
          </p>
        </div>

        <div className="slug" onClick={() => clipboard.copy(short_url)}>
          <h2>{clipboard.copied ? "copied" : slug}</h2>
        </div>
      </div>
      <style jsx>
        {`
          .clickable {
            cursor: pointer;
          }

          .link {
            margin: 0px 64px 0px 0px;
            display: inline-block;
          }

          .highlighted {
            background-color: ${gray(8)};
          }

          .status {
            margin: 0px 0px 0px 8px;
            display: inline-block;
            color: ${gray(15)};
            font-size: 8px;
          }

          .deleteButton {
            color: red;
            background-color: transparent;
          }
          .deleteButton:hover {
            background-color: ${gray(15)};
          }

          .linkOverlay {
            position: absolute;
            top: 30%;
            width: 100%;
            height: 0px;
            text-align: center;
          }

          .slug {
            color: ${gray(10)};
            font-weight: bold;
            font-size: 80px;
            word-break: keep-all;
            cursor: copy;
          }

          .long_url {
            font-size: 18px;
          }

          a {
            color: ${gray(15)};
            text-decoration: none;
          }

          h2 {
            margin: 0px;
            padding: 0px;
          }
        `}
      </style>
    </div>
  )
}

export default Link
