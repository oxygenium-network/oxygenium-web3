/*
Copyright 2018 - 2022 The Oxygenium Authors
This file is part of the oxygenium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
import { OxygeniumWindowObject, WalletProvider } from './types'

export const oxygeniumProvider: WalletProvider = {
  id: 'oxygenium',
  name: 'Oxygenium',
  icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgd2lkdGg9IjEwMCUiCiAgIGhlaWdodD0iMTAwJSIKICAgdmlld0JveD0iMCAwIDUxMiA1MTIiCiAgIHZlcnNpb249IjEuMSIKICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyIKICAgaWQ9InN2Zzk4ODQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnMKICAgaWQ9ImRlZnMxMCIgLz4KICAgIDxnCiAgIGlkPSJnMTAwNyI+PHJlY3QKICAgICB4PSIwIgogICAgIHk9IjAiCiAgICAgd2lkdGg9IjUxMi4wMDA2MSIKICAgICBoZWlnaHQ9IjUxMS45OTk5MSIKICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZS13aWR0aDowLjM1NTU1NiIKICAgICBpZD0icmVjdDk4NjUiIC8+PHBhdGgKICAgICBkPSJtIDIyMi44MjMyLDMwOS43OTQxMSBjIDAsLTQuMzYxMjQgLTMuNDQ2NzgsLTcuMjk4MzIgLTcuNzA0NTgsLTYuNTQ3NjYgbCAtNTAuODkwNzksOC45NzIwOSBjIC00LjI1Nzc5LDAuNzUwNjUgLTcuNzA0NTgsNC45MDMwOCAtNy43MDQ1OCw5LjI2NDMxIHYgOTYuMjM1OTggYyAwLDQuMzcxMTkgMy40NDY3OSw3LjMwODI3IDcuNzA0NTgsNi41NTc2MSBsIDUwLjg5MDc5LC04Ljk3MjA5IGMgNC4yNTc4LC0wLjc1MDY1IDcuNzA0NTgsLTQuOTAzMDggNy43MDQ1OCwtOS4yNzQyNyB6IgogICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjEuMDA0NyIKICAgICBpZD0icGF0aDk4NjciIC8+PHBhdGgKICAgICBkPSJtIDM1NS4zODYyLDk0LjMwNTMwNCBjIDAsLTQuMzYxMjM3IC0zLjQ0Njc4LC03LjI5ODMxNSAtNy43MDQ1OCwtNi41NDc2NjIgbCAtNTAuODkwNzksOC45NzIwOTUgYyAtNC4yNTc3OSwwLjc1MDY1MyAtNy43MDQ1OCw0LjkwMzA3MyAtNy43MDQ1OCw5LjI2NDMxMyB2IDk2LjIzNTk3IGMgMCw0LjM3MTIgMy40NDY3OSw3LjMwODI3IDcuNzA0NTgsNi41NTc2MiBsIDUwLjg5MDc5LC04Ljk3MjA5IGMgNC4yNTc4LC0wLjc1MDY2IDcuNzA0NTgsLTQuOTAzMDggNy43MDQ1OCwtOS4yNzQyNyB6IgogICAgIHN0eWxlPSJmaWxsOiNmZjVkNTE7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlLXdpZHRoOjEuMDA0NyIKICAgICBpZD0icGF0aDk4NzEiIC8+PHBhdGgKICAgICBkPSJtIDIzMS4wODk3OSwxMTYuNzY3NDEgYyAtMS45NjU1NSwtNC4zMjkwNSAtNy4yNDkxNiwtNy4xODEyNiAtMTEuODExMDgsLTYuMzc2OTkgbCAtNTQuNTI1NzgsOS42MTI5NiBjIC00LjU2MTkyLDAuODA0MjcgLTYuNjY0MjgsNC45NTg2MyAtNC42OTg3Miw5LjI4NzY4IGwgMTIwLjczOTcxLDI2NS45MjQxMiBjIDEuOTY1NTYsNC4zMjkwNiA3LjI2MDUzLDcuMjA2MjggMTEuODIyNDQsNi40MDIwMSBsIDU0LjUyNTc5LC05LjYxMjk1IGMgNC41NjE5MiwtMC44MDQyNyA2LjY1MjkxLC00Ljk4MzY1IDQuNjg3MzYsLTkuMzEyNzEgeiIKICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZS13aWR0aDoxLjcxMzM0IgogICAgIGlkPSJwYXRoOTg3NSIgLz48L2c+Cjwvc3ZnPgo=',
  downloads: {
    chrome: 'https://chrome.google.com/webstore/detail/oxygenium-extension-wallet',
    firefox: 'https://addons.mozilla.org/en-US/firefox/addon/oxygenium-extension-wallet'
  }
}

export const knownProviders: WalletProvider[] = [oxygeniumProvider]

export function checkProviderMetadata(wallet: OxygeniumWindowObject, provider: WalletProvider): boolean {
  return wallet.id === provider.id && wallet.name === provider.name
}
