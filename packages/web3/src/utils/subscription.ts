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

import EventEmitter from 'eventemitter3'

type MessageCallback<Message> = (message: Message) => Promise<void> | void
type ErrorCallback<Message> = (error: any, subscription: Subscription<Message>) => Promise<void> | void

export interface SubscribeOptions<Message> {
  pollingInterval: number
  messageCallback: MessageCallback<Message>
  errorCallback: ErrorCallback<Message>
}

export abstract class Subscription<Message> {
  pollingInterval: number

  protected messageCallback: MessageCallback<Message>
  protected errorCallback: ErrorCallback<Message>
  protected task: ReturnType<typeof setTimeout> | undefined
  protected eventEmitter: EventEmitter
  protected cancelled: boolean

  constructor(options: SubscribeOptions<Message>) {
    this.pollingInterval = options.pollingInterval
    this.messageCallback = options.messageCallback
    this.errorCallback = options.errorCallback
    this.task = undefined
    this.cancelled = false
    this.eventEmitter = new EventEmitter()
  }

  subscribe(): void {
    this.eventEmitter.on('tick', async () => {
      await this.polling()

      if (!this.cancelled) {
        this.task = setTimeout(() => this.eventEmitter.emit('tick'), this.pollingInterval)
      }
    })
    this.eventEmitter.emit('tick')
  }

  unsubscribe(): void {
    this.eventEmitter.removeAllListeners()
    this.cancelled = true
    if (typeof this.task !== 'undefined') {
      clearTimeout(this.task)
    }
  }

  isCancelled(): boolean {
    return this.cancelled
  }

  protected abstract polling(): Promise<void>
}
