- [view online -> (make sure HTTPS is not used) http://lh00000000-public.s3.us-east-1.amazonaws.com/2020/urlshort/index.html (2020-07-09)](http://lh00000000-public.s3.us-east-1.amazonaws.com/2020/urlshort/index.html)
- run locally -> `yarn dev` (after doing `echo "NEXT_PUBLIC_GB_TOKEN=${GB_TOKEN}" >.env.local`)
- run tests -> `yarn test`

Questionable Decisions
- next.js -> because it seems to have become the standard, and i don't have npm-workflow-setup skills to show off
- almost no data validation -> because the api seemed to do a bit of validation, so i wildly interpreted this to mean that was all the validation desired. also wanted emojis
