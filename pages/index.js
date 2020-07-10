import React, { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import _ from "lodash"
import Adder from "../components/Adder"
import Link from "../components/Link"
import { gray } from "../util"
import api from "../api"

export default (Home) => {
  const [links, setLinks] = useState([])
  const refreshData = () => api.get.all().then(setLinks)
  useEffect(() => {
    refreshData()
  }, [])
  return (
    <div id="main">
      <div id="links">
        {links.map((l) => {
          return <Link key={l.slug} {...l} triggerRefresh={refreshData} />
        })}
      </div>
       <Adder triggerRefresh={refreshData} />
      <style jsx>
        {`
          #main {
            margin-left: 16px;
          }
          #links {
            margin: 24px 0px 16px 0px;
          }
        `}
      </style>
      <style jsx global>
        {`
          * {
            font-family: Courier New;
          }
          body {
            margin: 0px;
            background-color: ${gray(1)};
          }
          .offensive {
            color: rgb(255, 40, 40);
          }
          .newPositionOrigin {
            position: relative;
            top: 0px;
            left: 0px;
          }

          .hidden {
            visibility: hidden;
          }
        `}
      </style>
    </div>
  )
}
