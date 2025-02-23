#!/usr/bin/env node
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

const execSync = require('child_process').execSync
const path = require('path')
const { exit } = require('process')

// remove the `npx cli` prefix
const index = process.argv.findIndex((arg) => arg.includes('@oxygenium/cli') || arg.includes('cli.js') || arg.includes('cli'))
if (index === -1) {
  console.log('Please run "npx @oxygenium/cli@latest <command>"')
  exit(-1)
}
const argString = process.argv.slice(index + 1).join(' ')
const cliRootPath = path.resolve(__dirname)
const cliInternalPath = path.join(cliRootPath, 'cli_internal.ts')
const command = `npx --yes ts-node --transpile-only ${cliInternalPath} ${argString}`
execSync(command, {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
})
